-- Securely create shared shop records and private user-shop relationships.

create or replace function public.create_user_shop(
  p_name text,
  p_specialty text default null,
  p_address text default null,
  p_phone text default null,
  p_website text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_owner uuid := auth.uid();
  created_shop_id uuid;
  clean_name text := nullif(trim(p_name), '');
  clean_address text := nullif(trim(p_address), '');
begin
  if current_owner is null then
    raise exception 'Authentication required';
  end if;

  if clean_name is null or char_length(clean_name) > 160 then
    raise exception 'Enter a valid shop name';
  end if;

  select s.id into created_shop_id
  from public.shops s
  where lower(s.name) = lower(clean_name)
    and coalesce(lower(s.address), '') = coalesce(lower(clean_address), '')
  limit 1;

  if created_shop_id is null then
    insert into public.shops (name, specialty, address, phone, website)
    values (
      clean_name,
      nullif(trim(p_specialty), ''),
      clean_address,
      nullif(trim(p_phone), ''),
      nullif(trim(p_website), '')
    )
    returning id into created_shop_id;
  end if;

  insert into public.user_shops (owner_id, shop_id)
  values (current_owner, created_shop_id)
  on conflict (owner_id, shop_id) do nothing;

  return created_shop_id;
end;
$$;

revoke all on function public.create_user_shop(text, text, text, text, text) from public;
grant execute on function public.create_user_shop(text, text, text, text, text) to authenticated;
