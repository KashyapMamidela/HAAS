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
  - `Select`'s `SelectValue` shows the raw value string by default; it does
    NOT auto-read the matching `SelectItem`'s children like Radix did. Pass
    an `items={{ value: "Label" }}` map to the `Select` root (or a render
    function as `SelectValue`'s children) so the trigger shows the label.
  - The default theme (light/dark) is controlled by `next-themes` in
    `src/app/layout.tsx` — currently pinned to light (`defaultTheme="light"`,
    `enableSystem={false}`) per product decision; `ThemeToggle` still lets
    users switch to dark.

