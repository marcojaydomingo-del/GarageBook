-- Final repair evidence and completion gates. Warranty evidence remains optional.

alter table public.maintenance_records add column if not exists invoice_number text;
alter table public.maintenance_records add column if not exists invoice_date date;

alter table public.maintenance_records drop constraint if exists maintenance_records_invoice_number_length;
alter table public.maintenance_records add constraint maintenance_records_invoice_number_length
  check (invoice_number is null or char_length(invoice_number) <= 120);

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
  if new.status = 'completed' and (
    new.maintenance_record_id is null or not exists (
      select 1 from public.maintenance_records mr
      where mr.id = new.maintenance_record_id and mr.vehicle_id = new.vehicle_id and mr.owner_id = new.owner_id and mr.record_type = 'repair'
    )
  ) then raise exception 'A completed repair record is required'; end if;
  return new;
end;
$$;
