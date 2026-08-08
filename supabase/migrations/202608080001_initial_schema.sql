-- GarageBook initial schema. All user-owned rows are protected by owner_id RLS.
create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  year smallint not null check (year between 1886 and 2200),
  make text not null,
  model text not null,
  trim text,
  vin text check (vin is null or char_length(vin) = 17),
  color text,
  current_mileage integer not null default 0 check (current_mileage >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.shops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  specialty text,
  address text,
  phone text,
  website text,
  is_preferred boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.maintenance_records (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  shop_id uuid references public.shops(id) on delete set null,
  record_type text not null check (record_type in ('maintenance','repair','inspection')),
  title text not null,
  description text,
  performed_at date not null,
  mileage integer check (mileage is null or mileage >= 0),
  cost numeric(12,2) check (cost is null or cost >= 0),
  warranty_expires_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.symptoms (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  title text not null,
  description text,
  severity text not null default 'medium' check (severity in ('low','medium','high')),
  frequency text check (frequency in ('once','intermittent','constant')),
  status text not null default 'open' check (status in ('open','monitoring','resolved')),
  warning_light boolean not null default false,
  first_noticed_at date not null,
  mileage integer check (mileage is null or mileage >= 0),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.repair_cases (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  symptom_id uuid references public.symptoms(id) on delete set null,
  shop_id uuid references public.shops(id) on delete set null,
  maintenance_record_id uuid references public.maintenance_records(id) on delete set null,
  title text not null,
  status text not null default 'diagnosing' check (status in ('diagnosing','estimated','approved','in_repair','completed','closed')),
  estimate_amount numeric(12,2) check (estimate_amount is null or estimate_amount >= 0),
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.shop_visits (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  shop_id uuid not null references public.shops(id) on delete cascade,
  repair_case_id uuid references public.repair_cases(id) on delete set null,
  visited_at timestamptz not null,
  mileage integer check (mileage is null or mileage >= 0),
  purpose text,
  notes text,
  created_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  maintenance_record_id uuid references public.maintenance_records(id) on delete set null,
  repair_case_id uuid references public.repair_cases(id) on delete set null,
  document_type text not null check (document_type in ('receipt','invoice','estimate','photo','warranty','other')),
  storage_path text not null,
  file_name text not null,
  mime_type text,
  file_size_bytes bigint check (file_size_bytes is null or file_size_bytes >= 0),
  uploaded_at timestamptz not null default now()
);

create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  title text not null,
  due_date date,
  due_mileage integer check (due_mileage is null or due_mileage >= 0),
  status text not null default 'pending' check (status in ('pending','completed','dismissed')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index vehicles_owner_id_idx on public.vehicles(owner_id);
create index maintenance_vehicle_date_idx on public.maintenance_records(vehicle_id, performed_at desc);
create index symptoms_vehicle_date_idx on public.symptoms(vehicle_id, first_noticed_at desc);
create index repair_cases_vehicle_idx on public.repair_cases(vehicle_id);
create index shop_visits_vehicle_date_idx on public.shop_visits(vehicle_id, visited_at desc);
create index documents_vehicle_idx on public.documents(vehicle_id);
create index reminders_vehicle_idx on public.reminders(vehicle_id);

alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.maintenance_records enable row level security;
alter table public.symptoms enable row level security;
alter table public.repair_cases enable row level security;
alter table public.shops enable row level security;
alter table public.shop_visits enable row level security;
alter table public.documents enable row level security;
alter table public.reminders enable row level security;

create policy "profiles_owner_all" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());
create policy "vehicles_owner_all" on public.vehicles for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "maintenance_owner_all" on public.maintenance_records for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "symptoms_owner_all" on public.symptoms for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "repair_cases_owner_all" on public.repair_cases for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "shops_owner_all" on public.shops for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "shop_visits_owner_all" on public.shop_visits for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "documents_owner_all" on public.documents for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "reminders_owner_all" on public.reminders for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Storage objects should use paths shaped as: <auth.uid()>/<vehicle-id>/<filename>.
insert into storage.buckets (id, name, public) values ('vehicle-documents','vehicle-documents',false)
on conflict (id) do nothing;
create policy "vehicle_documents_owner_select" on storage.objects for select using (bucket_id = 'vehicle-documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "vehicle_documents_owner_insert" on storage.objects for insert with check (bucket_id = 'vehicle-documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "vehicle_documents_owner_update" on storage.objects for update using (bucket_id = 'vehicle-documents' and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = 'vehicle-documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "vehicle_documents_owner_delete" on storage.objects for delete using (bucket_id = 'vehicle-documents' and (storage.foldername(name))[1] = auth.uid()::text);
