-- Structured, owner-scoped estimates and evidence-driven repair approvals.

alter table public.estimates add column if not exists decision_at timestamptz;
alter table public.documents add column if not exists estimate_id uuid;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'documents_estimate_owner_fk') then
    alter table public.documents
      add constraint documents_estimate_owner_fk
      foreign key (estimate_id, owner_id) references public.estimates(id, owner_id)
      on delete set null (estimate_id);
  end if;
end;
$$;

create unique index if not exists estimates_one_approved_per_case_idx
  on public.estimates (repair_case_id)
  where status = 'approved';

create or replace function public.protect_estimate_history()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if new.status <> 'draft' then raise exception 'New estimates must begin as drafts'; end if;
    return new;
  end if;

  if tg_op = 'DELETE' then
    if old.status <> 'draft' then
      raise exception 'Only draft estimates can be deleted';
    end if;
    return old;
  end if;

  if old.status in ('approved', 'declined', 'expired') then
    raise exception 'Decided estimates are locked';
  end if;

  if old.status = 'received'
    and coalesce(current_setting('garagebook.editing_estimate', true), '') <> 'true'
    and coalesce(current_setting('garagebook.deciding_estimate', true), '') <> 'true' then
    raise exception 'Use the estimate workflow to modify a received estimate';
  end if;

  if old.status = 'draft' and new.status = 'received' and not exists (
    select 1 from public.estimate_items item where item.estimate_id = old.id and item.owner_id = old.owner_id
  ) then raise exception 'A received estimate requires work items'; end if;

  if new.status = 'approved'
    and coalesce(current_setting('garagebook.approving_estimate', true), '') <> 'true' then
    raise exception 'Use the estimate decision workflow to approve an estimate';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_estimate_history on public.estimates;
create trigger protect_estimate_history
before insert or update or delete on public.estimates
for each row execute procedure public.protect_estimate_history();

create or replace function public.protect_estimate_items()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  linked_estimate_id uuid;
  linked_status text;
begin
  linked_estimate_id := case when tg_op = 'DELETE' then old.estimate_id else new.estimate_id end;
  select e.status into linked_status from public.estimates e where e.id = linked_estimate_id;
  if linked_status in ('approved', 'declined', 'expired')
    or (linked_status = 'received' and coalesce(current_setting('garagebook.editing_estimate', true), '') <> 'true') then
    raise exception 'Decided estimate items are locked';
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

drop trigger if exists protect_estimate_items on public.estimate_items;
create trigger protect_estimate_items
before insert or update or delete on public.estimate_items
for each row execute procedure public.protect_estimate_items();

create or replace function public.upsert_repair_estimate(
  p_estimate_id uuid,
  p_repair_case_id uuid,
  p_vehicle_id uuid,
  p_shop_id uuid,
  p_status text,
  p_estimate_date date,
  p_expires_at date,
  p_notes text,
  p_items jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_owner uuid := auth.uid();
  current_case_status text;
  existing_status text;
  saved_estimate_id uuid;
begin
  if current_owner is null then raise exception 'Authentication required'; end if;
  if p_status not in ('draft', 'received') then raise exception 'Invalid estimate status'; end if;
  if p_estimate_date is null then raise exception 'Estimate date is required'; end if;
  if p_expires_at is not null and p_expires_at < p_estimate_date then raise exception 'Expiration must follow the estimate date'; end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) < 1 or jsonb_array_length(p_items) > 50 then
    raise exception 'Add between 1 and 50 estimate items';
  end if;

  select rc.status into current_case_status
  from public.repair_cases rc
  where rc.id = p_repair_case_id and rc.vehicle_id = p_vehicle_id and rc.owner_id = current_owner
  for update;
  if current_case_status is null then raise exception 'Repair case not found'; end if;
  if current_case_status = 'closed' then raise exception 'Closed repair cases cannot receive estimates'; end if;
  if not exists (select 1 from public.shops s where s.id = p_shop_id) then raise exception 'Repair shop not found'; end if;

  if exists (
    select 1 from jsonb_to_recordset(p_items) as item(description text, category text, parts_cost numeric, labor_cost numeric, quantity numeric)
    where nullif(trim(item.description), '') is null
      or coalesce(item.parts_cost, 0) < 0
      or coalesce(item.labor_cost, 0) < 0
      or coalesce(item.quantity, 0) <= 0
  ) then raise exception 'Estimate items contain invalid values'; end if;

  if p_estimate_id is null then
    insert into public.estimates (owner_id, repair_case_id, vehicle_id, shop_id, status, estimate_date, expires_at, notes)
    values (current_owner, p_repair_case_id, p_vehicle_id, p_shop_id, 'draft', p_estimate_date, p_expires_at, nullif(trim(p_notes), ''))
    returning id into saved_estimate_id;
  else
    select e.status into existing_status from public.estimates e
    where e.id = p_estimate_id and e.repair_case_id = p_repair_case_id and e.vehicle_id = p_vehicle_id and e.owner_id = current_owner
    for update;
    if existing_status is null then raise exception 'Estimate not found'; end if;
    if existing_status not in ('draft', 'received') then raise exception 'This estimate is locked'; end if;
    if existing_status = 'received' and p_status <> 'received' then raise exception 'A received estimate cannot return to draft'; end if;
    perform set_config('garagebook.editing_estimate', 'true', true);
    update public.estimates set shop_id = p_shop_id, status = existing_status, estimate_date = p_estimate_date,
      expires_at = p_expires_at, notes = nullif(trim(p_notes), ''), updated_at = now()
    where id = p_estimate_id and owner_id = current_owner;
    delete from public.estimate_items where estimate_id = p_estimate_id and owner_id = current_owner;
    saved_estimate_id := p_estimate_id;
  end if;

  insert into public.estimate_items (owner_id, estimate_id, description, category, parts_cost, labor_cost, quantity)
  select current_owner, saved_estimate_id, trim(item.description), nullif(trim(item.category), ''),
    coalesce(item.parts_cost, 0), coalesce(item.labor_cost, 0), item.quantity
  from jsonb_to_recordset(p_items) as item(description text, category text, parts_cost numeric, labor_cost numeric, quantity numeric);

  if p_status = 'received' then
    update public.estimates set status = 'received', updated_at = now() where id = saved_estimate_id and owner_id = current_owner;
  end if;

  update public.repair_cases set shop_id = p_shop_id, updated_at = now() where id = p_repair_case_id and owner_id = current_owner;
  if p_status = 'received' and current_case_status = 'diagnosing' then
    update public.repair_cases set status = 'estimated', updated_at = now() where id = p_repair_case_id and owner_id = current_owner;
  end if;
  return saved_estimate_id;
end;
$$;

create or replace function public.decide_repair_estimate(p_estimate_id uuid, p_decision text)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_owner uuid := auth.uid();
  estimate_row public.estimates%rowtype;
  current_case_status text;
begin
  if current_owner is null then raise exception 'Authentication required'; end if;
  if p_decision not in ('approved', 'declined') then raise exception 'Invalid estimate decision'; end if;
  select * into estimate_row from public.estimates e where e.id = p_estimate_id and e.owner_id = current_owner for update;
  if estimate_row.id is null then raise exception 'Estimate not found'; end if;
  if estimate_row.status <> 'received' then raise exception 'Only received estimates can be decided'; end if;
  if p_decision = 'approved' and estimate_row.expires_at is not null and estimate_row.expires_at < current_date then
    raise exception 'This estimate has expired';
  end if;

  select rc.status into current_case_status from public.repair_cases rc
  where rc.id = estimate_row.repair_case_id and rc.vehicle_id = estimate_row.vehicle_id and rc.owner_id = current_owner
  for update;
  if current_case_status is null then raise exception 'Repair case not found'; end if;
  if current_case_status in ('closed', 'completed') then raise exception 'This repair case no longer accepts decisions'; end if;

  if p_decision = 'approved' then
    perform set_config('garagebook.approving_estimate', 'true', true);
  end if;
  perform set_config('garagebook.deciding_estimate', 'true', true);
  update public.estimates set status = p_decision, decision_at = now(), updated_at = now()
  where id = p_estimate_id and owner_id = current_owner;

  if p_decision = 'approved' and current_case_status = 'estimated' then
    update public.repair_cases set status = 'approved', shop_id = estimate_row.shop_id, updated_at = now()
    where id = estimate_row.repair_case_id and owner_id = current_owner;
  end if;
end;
$$;

create or replace function public.delete_draft_estimate(p_estimate_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not exists (select 1 from public.estimates e where e.id = p_estimate_id and e.owner_id = auth.uid() and e.status = 'draft') then
    raise exception 'Only your draft estimates can be deleted';
  end if;
  delete from public.estimates where id = p_estimate_id and owner_id = auth.uid() and status = 'draft';
end;
$$;

create or replace function public.enforce_repair_case_status_transition()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.status is not distinct from old.status then return new; end if;
  if old.status in ('completed', 'closed') then raise exception 'This repair case is already closed'; end if;
  if not (
    new.status = 'closed'
    or (old.status = 'diagnosing' and new.status = 'estimated')
    or (old.status = 'estimated' and new.status = 'approved')
    or (old.status = 'approved' and new.status = 'in_repair')
    or (old.status = 'in_repair' and new.status = 'completed')
  ) then raise exception 'Invalid repair case transition'; end if;
  if new.status = 'estimated' and not exists (
    select 1 from public.estimates e where e.repair_case_id = new.id and e.owner_id = new.owner_id and e.status in ('received', 'approved')
  ) then raise exception 'A received estimate is required'; end if;
  if new.status = 'approved' and not exists (
    select 1 from public.estimates e where e.repair_case_id = new.id and e.owner_id = new.owner_id and e.status = 'approved'
  ) then raise exception 'An approved estimate is required'; end if;
  return new;
end;
$$;

revoke all on function public.upsert_repair_estimate(uuid, uuid, uuid, uuid, text, date, date, text, jsonb) from public;
revoke all on function public.decide_repair_estimate(uuid, text) from public;
revoke all on function public.delete_draft_estimate(uuid) from public;
grant execute on function public.upsert_repair_estimate(uuid, uuid, uuid, uuid, text, date, date, text, jsonb) to authenticated;
grant execute on function public.decide_repair_estimate(uuid, text) to authenticated;
grant execute on function public.delete_draft_estimate(uuid) to authenticated;
