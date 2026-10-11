# Divine Tattoo → Zyberlane Platform

This branch switches the public gallery and existing client CMS to Zyberlane's
central Supabase project. Design, static assets, hosting and domain stay the same.

## Configuration and data mapping

- Shared browser configuration: `supabase-config.js` (publishable key only).
- Backend: `dgolqzznwsjjuuuoygug`; client: `30ec6ac5-2756-4a5f-88ae-ab6ddb7a3c85`.
- `portfolio` becomes `portfolio_items`; `idid` maps to the destination record `id`.
- Every gallery query/mutation is scoped to `client_id`; RLS enforces membership.
- Images use `client-portfolio/<client_id>/<filename>` and central `image_url` values.
- The existing client's email identity and password hash were copied, with a client
  profile and membership. Existing sessions are not portable: sign in again.
- Ordering uses `move_client_portfolio_item_to_position`; inserts append using an
  advisory-lock-protected trigger. Both run as the caller under RLS.
- `database/central-portfolio.sql` records the additive SQL applied to the central
  backend. Do not rerun its CREATE TRIGGER statement on an already prepared project.
- The read-only `public-portfolio` Edge Function is included for compatibility.
  It uses the public API key and RLS, without administrative read privileges.

## Behaviour and fallback

The live gallery is authoritative, including a successful empty result. Unpublishing
all images no longer resurrects the static gallery. The existing GitHub image
fallback remains for backend/network failures; those bundled public images may
therefore still appear during an outage.

Deletion confirms the database removal before removing the file. If Storage cleanup
fails, the CMS reports it; the unused file can be removed later by the platform owner.
As before, portfolio buckets are public: unpublishing removes a gallery entry but
does not make a known image URL private.

## Verification and cutover

Run `node --experimental-vm-modules --test tests/platform-config.test.mjs`.
Run `node --check` for the modified JavaScript files and `git diff --check`.

Before merging/deploying:
1. Confirm central Storage has all 35 files and all 35 rows use central URLs.
2. Sign in on a branch preview using the client's existing password.
3. Upload a temporary test image; publish/unpublish, move it, then delete it.
4. Check the public gallery, mobile layout, view-all and lightbox.
5. Confirm anonymous and unrelated client accounts cannot modify this tenant.

Database checks exercised authorized insert/order/publish/delete and rejected
nonmember/anonymous update and reorder, inside transactions rolled back after tests.
These checks do not replace real browser login and Storage upload testing.

Migration verification on 2026-10-11: 35 central records, 35 copied files,
9,118,891 bytes, all source/destination image SHA-256 checksums matched, positions
1–35 preserved. The public endpoint returned HTTP 200 with all 35 central URLs.
The original account password-hash fingerprint and email confirmation were
preserved; the original 35 source rows were unchanged at the end of the transfer.
The temporary authenticated transfer function was replaced by an HTTP 410 handler.

The security advisor still flags existing SECURITY DEFINER authorization helpers
and disabled leaked-password protection. This migration does not broaden those
helpers or alter platform-wide Auth settings. See
[function access](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable)
and [password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

## Recovery and original project

The original project `igjsnwpcyjgjjhpmpkvi` remains intact. An application recovery
snapshot was saved separately (gallery records, actual images/checksums, policies,
functions and pre-change destination mapping). It is not a full PostgreSQL dump and
does not contain passwords, sessions, signing keys, SMTP/OAuth secrets or all project
settings. Do not put account data or secrets into this public repository.

Reverting this branch restores the original website connection while the old project
exists. New edits made after central cutover will not automatically appear in the
old backend; reconcile them before reverting. Avoid edits in both backends during
cutover, and reconcile any source changes made after the snapshot before deployment.

Never delete, pause, or decommission the original project without the owner's
separate explicit approval after verification.
