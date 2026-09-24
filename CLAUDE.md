@AGENTS.md

# Hospital appointment system

- Three roles: patient, doctor, admin. One Supabase Auth; the role lives in
  `profiles.role` and is mirrored into the JWT as the `user_role` claim via a
  Custom Access Token Hook.
- Route groups: `(public)`, `(patient)`, `(doctor)`, `(admin)` under `src/app`.
  `src/proxy.ts` guards them by role and redirects wrong-portal logins.
- All data access is protected by Postgres Row Level Security. Never rely on
  UI checks or route guards alone — RLS is the real security boundary.
- Mutations go through server actions validated with zod. Never trust
  client-supplied data without re-validating server-side.
- Store all timestamps in UTC; display them in Asia/Kolkata.
- `src/lib/supabase/client.ts` — browser client (anon key).
- `src/lib/supabase/server.ts` — server client bound to request cookies (anon
  key + user's session, respects RLS). Call fresh in every server
  action/route handler/RSC — never cache it at module scope.
- `src/lib/supabase/admin.ts` — service-role client, bypasses RLS. Marked
  `server-only`; only for trusted admin operations like inviting doctors.
  Never import into client components.

## Design system

Warm, minimal, calm — inspired by Claude's interface. Tokens live in
`src/app/globals.css` (`--bg`, `--surface`, `--surface-muted`, `--border`,
`--text`, `--text-muted`, `--accent`, `--accent-soft`, `--success`,
`--warning`, `--danger`, light + dark). Rules:

- One primary action per screen; everything else is secondary or tucked away.
- Serif headings (Source Serif 4), sans body (Inter). Sentence case, no ALL CAPS.
- Hairline 1px borders instead of heavy shadows; shadows reserved for
  dialogs/popovers only.
- Status shown as soft tinted pills (StatusPill), never solid loud badges.
- Skeletons for loading, never full-page spinners.
- Every empty/error state names a next action (EmptyState component).
- Mobile-first; WCAG AA contrast; visible accent focus ring; 44px touch targets.
- Dark mode via `next-themes`, following the system by default.
- Always reuse the shared components in `src/components/ui` (shadcn/ui,
  restyled to the tokens) and `src/components/app` (StatusPill, EmptyState,
  PageHeader, Stepper, StatCard, AppShell, ThemeToggle) rather than writing
  ad-hoc styles.

## Stack notes

- Next.js 16 App Router. Middleware is renamed to Proxy — the file is
  `src/proxy.ts`, exporting `proxy`, not `middleware.ts`.
- Supabase CLI config is in `supabase/config.toml`; migrations in
  `supabase/migrations/`. Generate types with
  `npx supabase gen types typescript --local > src/lib/database.types.ts`.
- shadcn/ui here is built on **Base UI** (`@base-ui/react`), not Radix.
  - To render a custom element as a trigger/close button, use the `render`
    prop (`<DialogTrigger render={<Button variant="outline" />}>Label</DialogTrigger>`),
    not `asChild`. Put the visible content as children of the primitive, not
    inside the `render` element — Base UI merges them.
  - When `Button` itself renders as a link (`<Button render={<Link href="..."/>}>`),
    also pass `nativeButton={false}` — otherwise Base UI logs an a11y warning
    because it expects `render` to produce a real `<button>` by default.
  - `Select`'s `SelectValue` shows the raw value string by default; it does
    NOT auto-read the matching `SelectItem`'s children like Radix did. Pass
    an `items={{ value: "Label" }}` map to the `Select` root (or a render
    function as `SelectValue`'s children) so the trigger shows the label.
  - The default theme (light/dark) is controlled by `next-themes` in
    `src/app/layout.tsx` — currently pinned to light (`defaultTheme="light"`,
    `enableSystem={false}`) per product decision; `ThemeToggle` still lets
    users switch to dark.

## Database (Phase 2)

- Schema lives in `supabase/migrations/`, applied in filename order:
  extensions -> enums -> tables -> functions/triggers -> RLS -> booking RPCs.
  `supabase/seed.sql` creates 4 departments, 6 doctors (with weekly
  schedules) and 3 patients, plus 1 admin — every seeded account's password
  is `password123`.
- **Booking and availability are RPC-only, never raw inserts**: call
  `book_appointment(p_doctor_id, p_start_at, p_reason)` to create an
  appointment and `get_available_slots(p_doctor_id, p_date)` to list free
  slots. Both are `SECURITY DEFINER` because they must see every booking
  for that doctor (not just the caller's own) to validate correctly — RLS
  on `appointments` intentionally has no patient-facing insert policy.
  Cancel/reschedule RPCs don't exist yet; add them the same way rather than
  updating `appointments` directly from a patient-facing server action.
- A doctor CAN update their own `appointments` rows directly (RLS allows
  it) for queue status transitions (checked_in -> in_consultation ->
  completed/no_show) — no RPC needed there since it doesn't touch time/
  overlap validation.
- `doctor_schedules.weekday` is `0`=Sunday..`6`=Saturday
  (`extract(dow from ...)`), and `start_time`/`end_time` are wall-clock
  **Asia/Kolkata** times, not UTC — both RPCs convert explicitly.
- Role changes (patient -> doctor/admin) only ever happen via `UPDATE
  profiles SET role = ...` run by a trusted server context (service-role
  admin client or seed.sql). The `handle_new_user` trigger always creates
  new profiles as `'patient'`, matching "no public sign-up" for doctor/admin.
- `src/lib/database.types.ts` is currently **hand-written** to match the
  migrations (no live database was available to run `supabase gen types`
  yet). Regenerate it once a local (`supabase start`) or linked project
  exists, and diff — it should be a near no-op if the schema matches.
- The Custom Access Token Hook (`public.custom_access_token_hook`) is
  enabled for local dev via `supabase/config.toml`
  (`[auth.hook.custom_access_token]`). On a hosted project this must also
  be turned on manually from the dashboard: Authentication -> Hooks ->
  Customize Access Token, pointing at `public.custom_access_token_hook`.

