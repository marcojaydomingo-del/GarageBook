-- GarageBook Phase 2 baseline schema.
-- Composite foreign keys enforce same-owner relationships independently of RLS.
create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vehicles (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.profiles(id) on delete cascade,
  year smallint not null check (year between 1886 and 2200), make text not null, model text not null, trim text,
  vin text check (vin is null or char_length(vin) = 17), color text,
  current_mileage integer not null default 0 check (current_mileage >= 0),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (id, owner_id)
);

-- Shops are shared entities. A user's preferences and notes live in user_shops.
create table public.shops (
  id uuid primary key default gen_random_uuid(), name text not null, specialty text, address text, phone text, website text,
  google_place_id text unique, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.user_shops (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.profiles(id) on delete cascade,
  shop_id uuid not null references public.shops(id) on delete cascade, preferred boolean not null default false,
  private_notes text, personal_rating smallint check (personal_rating between 1 and 5),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (owner_id, shop_id), unique (id, owner_id)
);

create table public.maintenance_records (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.profiles(id) on delete cascade,
  vehicle_id uuid not null, shop_id uuid references public.shops(id) on delete set null,
  record_type text not null check (record_type in ('maintenance','repair','inspection')), title text not null, description text,
  performed_at date not null, mileage integer check (mileage is null or mileage >= 0), cost numeric(12,2) check (cost is null or cost >= 0),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (id, owner_id), foreign key (vehicle_id, owner_id) references public.vehicles(id, owner_id) on delete cascade
);

create table public.symptoms (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.profiles(id) on delete cascade,
  vehicle_id uuid not null, title text not null, description text,
  severity text not null default 'medium' check (severity in ('low','medium','high')),
  frequency text check (frequency in ('once','intermittent','constant')),
  status text not null default 'open' check (status in ('open','monitoring','resolved')),
  warning_light boolean not null default false, first_noticed_at date not null,
  mileage integer check (mileage is null or mileage >= 0), resolved_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (id, owner_id), foreign key (vehicle_id, owner_id) references public.vehicles(id, owner_id) on delete cascade
);

create table public.repair_cases (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.profiles(id) on delete cascade,
  vehicle_id uuid not null, symptom_id uuid, shop_id uuid references public.shops(id) on delete set null, maintenance_record_id uuid,
  title text not null, status text not null default 'diagnosing' check (status in ('diagnosing','estimated','approved','in_repair','completed','closed')),
  opened_at timestamptz not null default now(), closed_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (id, owner_id),
  foreign key (vehicle_id, owner_id) references public.vehicles(id, owner_id) on delete cascade,
  foreign key (symptom_id, owner_id) references public.symptoms(id, owner_id) on delete set null (symptom_id),
  foreign key (maintenance_record_id, owner_id) references public.maintenance_records(id, owner_id) on delete set null (maintenance_record_id)
);

create table public.shop_visits (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.profiles(id) on delete cascade,
  vehicle_id uuid not null, shop_id uuid not null references public.shops(id) on delete restrict, repair_case_id uuid,
  visited_at timestamptz not null, mileage integer check (mileage is null or mileage >= 0), purpose text, notes text,
  created_at timestamptz not null default now(), unique (id, owner_id),
  foreign key (vehicle_id, owner_id) references public.vehicles(id, owner_id) on delete cascade,
  foreign key (repair_case_id, owner_id) references public.repair_cases(id, owner_id) on delete set null (repair_case_id)
);

create table public.documents (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.profiles(id) on delete cascade,
  vehicle_id uuid not null, maintenance_record_id uuid, repair_case_id uuid,
  document_type text not null check (document_type in ('receipt','invoice','estimate','photo','warranty','other')),
  storage_path text not null unique, file_name text not null, mime_type text, file_size_bytes bigint check (file_size_bytes is null or file_size_bytes >= 0),
  uploaded_at timestamptz not null default now(), unique (id, owner_id),
  foreign key (vehicle_id, owner_id) references public.vehicles(id, owner_id) on delete cascade,
  foreign key (maintenance_record_id, owner_id) references public.maintenance_records(id, owner_id) on delete set null (maintenance_record_id),
  foreign key (repair_case_id, owner_id) references public.repair_cases(id, owner_id) on delete set null (repair_case_id)
);

create table public.reminders (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.profiles(id) on delete cascade,
  vehicle_id uuid not null, title text not null, due_date date, due_mileage integer check (due_mileage is null or due_mileage >= 0),
  status text not null default 'pending' check (status in ('pending','completed','dismissed')), completed_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (id, owner_id),
  foreign key (vehicle_id, owner_id) references public.vehicles(id, owner_id) on delete cascade
);

create table public.vehicle_mileage_entries (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.profiles(id) on delete cascade,
  vehicle_id uuid not null, mileage integer not null check (mileage >= 0), recorded_at timestamptz not null default now(),
  source text not null check (source in ('manual','maintenance','repair','receipt','shop','import')), created_at timestamptz not null default now(),
  unique (id, owner_id), foreign key (vehicle_id, owner_id) references public.vehicles(id, owner_id) on delete cascade
);

create table public.warranties (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.profiles(id) on delete cascade,
  vehicle_id uuid not null, maintenance_record_id uuid, repair_case_id uuid, shop_id uuid references public.shops(id) on delete set null,
  title text not null, provider text, start_date date, expiration_date date, start_mileage integer check (start_mileage is null or start_mileage >= 0),
  expiration_mileage integer check (expiration_mileage is null or expiration_mileage >= 0), notes text,
  status text not null default 'active' check (status in ('active','expired','claimed','void')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (id, owner_id),
  foreign key (vehicle_id, owner_id) references public.vehicles(id, owner_id) on delete cascade,
  foreign key (maintenance_record_id, owner_id) references public.maintenance_records(id, owner_id) on delete set null (maintenance_record_id),
  foreign key (repair_case_id, owner_id) references public.repair_cases(id, owner_id) on delete set null (repair_case_id)
);

create table public.estimates (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.profiles(id) on delete cascade,
  repair_case_id uuid not null, vehicle_id uuid not null, shop_id uuid not null references public.shops(id) on delete restrict,
  status text not null default 'draft' check (status in ('draft','received','approved','declined','expired')),
  estimate_date date, expires_at date, notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (id, owner_id),
  foreign key (repair_case_id, owner_id) references public.repair_cases(id, owner_id) on delete cascade,
  foreign key (vehicle_id, owner_id) references public.vehicles(id, owner_id) on delete cascade
);
create table public.estimate_items (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.profiles(id) on delete cascade,
  estimate_id uuid not null, description text not null, category text,
  parts_cost numeric(12,2) not null default 0 check (parts_cost >= 0), labor_cost numeric(12,2) not null default 0 check (labor_cost >= 0),
  quantity numeric(10,2) not null default 1 check (quantity > 0), total numeric(12,2) generated always as ((parts_cost + labor_cost) * quantity) stored,
  created_at timestamptz not null default now(), unique (id, owner_id),
  foreign key (estimate_id, owner_id) references public.estimates(id, owner_id) on delete cascade
);

create index vehicles_owner_idx on public.vehicles(owner_id);
create index maintenance_vehicle_date_idx on public.maintenance_records(vehicle_id, performed_at desc);
create index symptoms_vehicle_date_idx on public.symptoms(vehicle_id, first_noticed_at desc);
create index repair_cases_vehicle_idx on public.repair_cases(vehicle_id);
create index shop_visits_vehicle_date_idx on public.shop_visits(vehicle_id, visited_at desc);
create index documents_vehicle_idx on public.documents(vehicle_id);
create index reminders_vehicle_idx on public.reminders(vehicle_id);
create index mileage_vehicle_date_idx on public.vehicle_mileage_entries(vehicle_id, recorded_at desc);
create index warranties_vehicle_idx on public.warranties(vehicle_id);
create index estimates_case_idx on public.estimates(repair_case_id);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin insert into public.profiles (id, full_name) values (new.id, new.raw_user_meta_data ->> 'full_name') on conflict (id) do nothing; return new; end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.sync_vehicle_mileage() returns trigger language plpgsql security definer set search_path = '' as $$
begin update public.vehicles set current_mileage = greatest(current_mileage, new.mileage), updated_at = now() where id = new.vehicle_id and owner_id = new.owner_id; return new; end; $$;
create trigger on_mileage_entry after insert on public.vehicle_mileage_entries for each row execute procedure public.sync_vehicle_mileage();

alter table public.profiles enable row level security; alter table public.vehicles enable row level security;
alter table public.shops enable row level security; alter table public.user_shops enable row level security;
alter table public.maintenance_records enable row level security; alter table public.symptoms enable row level security;
alter table public.repair_cases enable row level security; alter table public.shop_visits enable row level security;
alter table public.documents enable row level security; alter table public.reminders enable row level security;
alter table public.vehicle_mileage_entries enable row level security; alter table public.warranties enable row level security;
alter table public.estimates enable row level security; alter table public.estimate_items enable row level security;

create policy "profiles_owner" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());
create policy "shops_authenticated_read" on public.shops for select to authenticated using (true);
create policy "vehicles_owner" on public.vehicles for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "user_shops_owner" on public.user_shops for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "maintenance_owner" on public.maintenance_records for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "symptoms_owner" on public.symptoms for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "repair_cases_owner" on public.repair_cases for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "shop_visits_owner" on public.shop_visits for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "documents_owner" on public.documents for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "reminders_owner" on public.reminders for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "mileage_owner" on public.vehicle_mileage_entries for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "warranties_owner" on public.warranties for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "estimates_owner" on public.estimates for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "estimate_items_owner" on public.estimate_items for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('vehicle-documents','vehicle-documents',false,10485760,array['application/pdf','image/jpeg','image/png','image/webp']) on conflict (id) do update
set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
create policy "vehicle_documents_owner_select" on storage.objects for select to authenticated using
  (bucket_id='vehicle-documents' and (storage.foldername(name))[1]=auth.uid()::text and exists(select 1 from public.vehicles v where v.id::text=(storage.foldername(name))[2] and v.owner_id=auth.uid()));
create policy "vehicle_documents_owner_insert" on storage.objects for insert to authenticated with check
  (bucket_id='vehicle-documents' and (storage.foldername(name))[1]=auth.uid()::text and exists(select 1 from public.vehicles v where v.id::text=(storage.foldername(name))[2] and v.owner_id=auth.uid()));
create policy "vehicle_documents_owner_update" on storage.objects for update to authenticated using
  (bucket_id='vehicle-documents' and (storage.foldername(name))[1]=auth.uid()::text) with check
  (bucket_id='vehicle-documents' and (storage.foldername(name))[1]=auth.uid()::text and exists(select 1 from public.vehicles v where v.id::text=(storage.foldername(name))[2] and v.owner_id=auth.uid()));
create policy "vehicle_documents_owner_delete" on storage.objects for delete to authenticated using
  (bucket_id='vehicle-documents' and (storage.foldername(name))[1]=auth.uid()::text);
