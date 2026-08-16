# Product

<!-- impeccable:product-schema 1 -->

## Platform

Web plus a native Expo/React Native client for iOS and Android. The responsive Next.js application remains the release foundation; the native client reuses Supabase, ownership rules, validation concepts, and domain behavior while following each operating system's navigation and interaction conventions.

## Users

GarageBook is for vehicle owners who want a durable, organized record of their vehicles’ maintenance and repair history. The launch audience is intentionally broad rather than limited to enthusiasts, professional mechanics, or owners of a particular vehicle type.

## Product Purpose

GarageBook helps vehicle owners understand and preserve the history of each vehicle. It should help them stay ahead of documented maintenance needs, reduce uncertainty during repairs, and maintain trustworthy records that can be used with repair shops or during a future sale.

Success means an owner can capture a vehicle’s history as work happens and later retrieve a clear, credible account without reconstructing it from scattered receipts, memories, messages, and shop paperwork.

## Positioning

GarageBook’s differentiating mechanism is a connected repair journey:

**Symptom → shop → estimate → repair → invoice → warranty → vehicle history**

The product is intended to preserve the context between these stages rather than treating maintenance entries, documents, symptoms, and shops as unrelated records.

## Operating Context

Owners use GarageBook before, during, and after vehicle service. They may log a symptom when it appears, record mileage, associate a repair shop and estimate, document completed maintenance or repair, upload invoices and photos, track warranty information, and review the resulting chronological history later.

The records are private by default. A future vehicle-passport capability may allow an owner to intentionally share selected vehicle history, but the exact sharing model remains undecided.

## Capabilities and Constraints

- Store multiple vehicles per authenticated owner.
- Record maintenance, repairs, symptoms, mileage, repair-shop relationships, and private documents.
- Present these records as one chronological vehicle timeline without introducing a separate giant timeline table.
- Calculate “Maintenance Status” only from documented facts such as overdue reminders, open symptoms, and unresolved repair cases; do not imply mechanical diagnosis or certainty.
- Keep authenticated owner data isolated through Supabase Row Level Security and database-level ownership constraints.
- Use shared shop entities with private per-user preferences and notes.
- Prepare for estimates, estimate line items, and warranties without requiring their full interfaces in the current release.
- Current web architecture: Next.js App Router → Supabase → Vercel.
- Native architecture: Expo Router / React Native → the same Supabase project and RLS policies.
- AI/OCR, Google Maps, payments, OBD-II, a shop marketplace, messaging, towing, and social features are outside the current scope.
- Email-confirmation policy, the exact vehicle-passport sharing model, and future shop-discovery behavior remain open product decisions.

## Brand Commitments

- The working product name is **GarageBook**.
- The working product mechanism is the connected repair journey described above.
- Owner records are private by default.
- A shareable vehicle passport is a future product direction, not a currently delivered claim.
- These commitments are accurate for current work but are explicitly provisional and may evolve.

## Evidence on Hand

- A functioning Next.js/Supabase application foundation exists in this repository, including authentication, vehicle records, maintenance records, symptoms, document upload preparation, repair shops, mileage history, and a combined timeline adapter.
- Realistic development-only sample records for a 2014 MINI Cooper S Paceman exist in `lib/sample-data.ts`; they are not evidence of user adoption or production usage.
- Four interface screenshots were supplied as reference material for future design work:
  - `/Users/mjdomingo/Desktop/Screenshot 2026-08-11 at 7.45.46 PM.png`
  - `/Users/mjdomingo/Desktop/Screenshot 2026-08-11 at 7.47.02 PM.png`
  - `/Users/mjdomingo/Desktop/Screenshot 2026-08-11 at 7.39.32 PM.png`
  - `/Users/mjdomingo/Desktop/Screenshot 2026-08-11 at 7.41.03 PM.png`
- No testimonials, customer counts, repair-cost savings, resale-value improvements, partnerships, press, or other market proof have been established and must not be fabricated.

## Product Principles

1. **Preserve the whole story.** Keep symptoms, decisions, shops, work, costs, documents, and warranties connected.
2. **Use documented facts.** Clearly separate recorded evidence from diagnosis, prediction, or mechanical certainty.
3. **Make ownership effortless.** Everyday vehicle owners should be able to capture and retrieve records without automotive expertise.
4. **Earn trust through control.** Keep records private by default and make any future sharing deliberate and understandable.
5. **Build the durable foundation first.** Strengthen the core record-keeping workflow before adding discovery, automation, commerce, or adjacent services.
