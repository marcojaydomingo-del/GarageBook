import { createClient } from "@supabase/supabase-js";

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "RLS_TEST_USER_A_EMAIL",
  "RLS_TEST_USER_A_PASSWORD",
  "RLS_TEST_USER_B_EMAIL",
  "RLS_TEST_USER_B_PASSWORD",
];
for (const name of required) {
  if (!process.env[name]) throw new Error(`Missing ${name}. Use two existing non-production test accounts.`);
}

const options = { auth: { persistSession: false, autoRefreshToken: false } };
const clientA = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, options);
const clientB = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, options);

async function signIn(client, email, password) {
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.user) throw new Error("Unable to sign in one of the RLS test accounts.");
  return data.user;
}

const userA = await signIn(clientA, process.env.RLS_TEST_USER_A_EMAIL, process.env.RLS_TEST_USER_A_PASSWORD);
const userB = await signIn(clientB, process.env.RLS_TEST_USER_B_EMAIL, process.env.RLS_TEST_USER_B_PASSWORD);
const created = [];

try {
  for (const [client, user, label] of [[clientA, userA, "A"], [clientB, userB, "B"]]) {
    const { data, error } = await client.from("vehicles").insert({ owner_id: user.id, year: 2014, make: "RLS", model: `Isolation ${label}`, current_mileage: 1 }).select("id").single();
    if (error || !data) throw new Error(`Unable to create test vehicle ${label}.`);
    created.push({ client, id: data.id });
  }

  const [{ data: aReadsB, error: aReadError }, { data: bReadsA, error: bReadError }] = await Promise.all([
    clientA.from("vehicles").select("id").eq("id", created[1].id),
    clientB.from("vehicles").select("id").eq("id", created[0].id),
  ]);
  if (aReadError || bReadError) throw new Error("RLS verification could not complete the cross-owner read checks.");
  if (aReadsB?.length || bReadsA?.length) throw new Error("RLS isolation failed: a user could read another user’s vehicle.");

  const { data: crossUpdate, error: crossUpdateError } = await clientA.from("vehicles").update({ color: "Blocked" }).eq("id", created[1].id).select("id");
  if (crossUpdateError) throw new Error("RLS verification could not complete the cross-owner update check.");
  if (crossUpdate?.length) throw new Error("RLS isolation failed: a user could update another user’s vehicle.");

  const { error: crossOwnerChildError } = await clientA.from("maintenance_records").insert({ owner_id: userA.id, vehicle_id: created[1].id, record_type: "maintenance", title: "Must fail", description: "Cross-owner relationship test", performed_at: "2026-08-15", mileage: 1, cost: 0 });
  if (!crossOwnerChildError) throw new Error("Ownership foreign key failed: a cross-owner maintenance record was accepted.");

  process.stdout.write("RLS verification passed: cross-owner reads, writes, and relationships were blocked.\n");
} finally {
  await Promise.all(created.map(({ client, id }) => client.from("vehicles").delete().eq("id", id)));
  await Promise.all([clientA.auth.signOut(), clientB.auth.signOut()]);
}
