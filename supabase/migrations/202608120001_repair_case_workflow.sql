-- Connect every symptom to one repair case without weakening owner RLS.

create unique index if not exists repair_cases_symptom_unique_idx
  on public.repair_cases(symptom_id)
  where symptom_id is not null;

-- Backfill unresolved symptoms created before this workflow existed.
insert into public.repair_cases (owner_id, vehicle_id, symptom_id, title, status, opened_at)
select s.owner_id, s.vehicle_id, s.id, s.title, 'diagnosing', s.created_at
from public.symptoms s
where s.status <> 'resolved'
  and not exists (
    select 1 from public.repair_cases rc where rc.symptom_id = s.id
  );

create or replace function public.open_repair_case_for_symptom()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  insert into public.repair_cases (owner_id, vehicle_id, symptom_id, title, status, opened_at)
  values (new.owner_id, new.vehicle_id, new.id, new.title, 'diagnosing', new.created_at)
  on conflict (symptom_id) where symptom_id is not null do nothing;
  return new;
end;
$$;

drop trigger if exists on_symptom_created_open_repair_case on public.symptoms;
create trigger on_symptom_created_open_repair_case
after insert on public.symptoms
for each row execute procedure public.open_repair_case_for_symptom();

create or replace function public.enforce_repair_case_status_transition()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.status is not distinct from old.status then
    return new;
  end if;

  if old.status in ('completed', 'closed') then
    raise exception 'This repair case is already closed';
  end if;

  if not (
    new.status = 'closed'
    or (old.status = 'diagnosing' and new.status = 'estimated')
    or (old.status = 'estimated' and new.status = 'approved')
    or (old.status = 'approved' and new.status = 'in_repair')
    or (old.status = 'in_repair' and new.status = 'completed')
  ) then
    raise exception 'Invalid repair case transition';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_repair_case_status_transition on public.repair_cases;
create trigger enforce_repair_case_status_transition
before update of status on public.repair_cases
for each row execute procedure public.enforce_repair_case_status_transition();

create or replace function public.transition_repair_case(
  p_vehicle_id uuid,
  p_repair_case_id uuid,
  p_status text
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_status text;
  linked_symptom_id uuid;
begin
  select rc.status, rc.symptom_id into current_status, linked_symptom_id
  from public.repair_cases rc
  where rc.id = p_repair_case_id
    and rc.vehicle_id = p_vehicle_id
    and rc.owner_id = auth.uid()
  for update;

  if current_status is null then
    raise exception 'Repair case not found';
  end if;

  if current_status in ('completed', 'closed') then
    raise exception 'This repair case is already closed';
  end if;

  if not (
    p_status = 'closed'
    or (current_status = 'diagnosing' and p_status = 'estimated')
    or (current_status = 'estimated' and p_status = 'approved')
    or (current_status = 'approved' and p_status = 'in_repair')
    or (current_status = 'in_repair' and p_status = 'completed')
  ) then
    raise exception 'Invalid repair case transition';
  end if;

  update public.repair_cases
  set status = p_status,
      closed_at = case when p_status in ('completed', 'closed') then now() else null end,
      updated_at = now()
  where id = p_repair_case_id and owner_id = auth.uid();

  if linked_symptom_id is not null and p_status in ('completed', 'closed') then
    update public.symptoms
    set status = 'resolved', resolved_at = now(), updated_at = now()
    where id = linked_symptom_id and owner_id = auth.uid();
  end if;
end;
$$;

revoke all on function public.transition_repair_case(uuid, uuid, text) from public;
grant execute on function public.transition_repair_case(uuid, uuid, text) to authenticated;
