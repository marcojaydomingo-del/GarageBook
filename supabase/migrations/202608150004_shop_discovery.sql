-- Save a Google Places listing as a shared shop while keeping the user's relationship private.
create or replace function public.save_discovered_shop(
  p_google_place_id text, p_name text, p_specialty text default null,
  p_address text default null, p_phone text default null, p_website text default null
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  current_owner uuid := auth.uid();
  saved_shop_id uuid;
  clean_place_id text := nullif(trim(p_google_place_id), '');
  clean_name text := nullif(trim(p_name), '');
  clean_address text := nullif(trim(p_address), '');
begin
  if current_owner is null then raise exception 'Authentication required'; end if;
  if clean_place_id is null or char_length(clean_place_id) > 300 then raise exception 'Invalid place identifier'; end if;
  if clean_name is null or char_length(clean_name) > 160 then raise exception 'Enter a valid shop name'; end if;

  select id into saved_shop_id from public.shops where google_place_id = clean_place_id limit 1;
  if saved_shop_id is null then
    select id into saved_shop_id from public.shops
    where lower(name) = lower(clean_name) and coalesce(lower(address), '') = coalesce(lower(clean_address), '') limit 1;
  end if;
  if saved_shop_id is null then
    insert into public.shops (name, specialty, address, phone, website, google_place_id)
    values (clean_name, nullif(trim(p_specialty), ''), clean_address, nullif(trim(p_phone), ''), nullif(trim(p_website), ''), clean_place_id)
    returning id into saved_shop_id;
  else
    update public.shops set google_place_id = coalesce(google_place_id, clean_place_id),
      specialty = coalesce(specialty, nullif(trim(p_specialty), '')), address = coalesce(address, clean_address),
      phone = coalesce(phone, nullif(trim(p_phone), '')), website = coalesce(website, nullif(trim(p_website), '')), updated_at = now()
    where id = saved_shop_id;
  end if;
  insert into public.user_shops (owner_id, shop_id) values (current_owner, saved_shop_id)
  on conflict (owner_id, shop_id) do nothing;
  return saved_shop_id;
end; $$;

revoke all on function public.save_discovered_shop(text, text, text, text, text, text) from public;
grant execute on function public.save_discovered_shop(text, text, text, text, text, text) to authenticated;
