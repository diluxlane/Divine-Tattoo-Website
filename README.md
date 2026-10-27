# Divine Tattoo Website

Client website for **Divine Tattoo**, developed as a responsive portfolio and content-managed web presence.

**Live website:** https://divinetattoo.vercel.app

## Overview

This repository contains the public Divine Tattoo website together with its portfolio/gallery experience, administrative content-management interface, Supabase integration, migration documentation and verification tests.

The website is designed to present tattoo work clearly while allowing authorized content management without exposing private administrative credentials in the repository.

## Highlights

- Responsive tattoo portfolio/gallery.
- Image browsing and lightbox-style viewing.
- Client-facing administrative/CMS interface.
- Publish, unpublish, reorder and remove portfolio items.
- Supabase-backed data, storage and authentication.
- Row Level Security-based access controls for client-scoped data.
- Fallback behavior for portfolio availability.
- Migration and verification documentation for the Zyberlane platform backend.

## Tech Stack

- **HTML / CSS / JavaScript** — public website and browser interaction
- **Supabase** — authentication, Postgres data and file storage
- **Vercel** — hosting and Git-based deployment

## Repository Structure

```text
index.html            Public website
styles.css            Main visual styling
script.js             Public-site behavior
assets/               Website and portfolio assets
admin/                Authorized content-management interface
supabase/             Supabase-related project resources
database/             Database/migration material
tests/                Configuration and integration verification
MIGRATION.md           Backend migration and recovery notes
supabase-config.js     Browser-safe client configuration
```

## Local Development

The public site is primarily static and can be served with a local HTTP server for browser testing.

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

Some gallery and CMS functionality depends on the configured Supabase backend and the permissions available to the current user.

## Verification

Repository tests and migration checks are intended to verify configuration, tenant scoping and expected portfolio behavior. See [`MIGRATION.md`](MIGRATION.md) for the detailed backend migration notes and operational safeguards.

Do not place passwords, service-role keys, private account data or other secrets in this public repository.

## Deployment

The repository is connected to Vercel.

**Production URL:** https://divinetattoo.vercel.app

## Client and Content Rights

**Divine Tattoo** is the client project represented by this website. Divine Tattoo's name, branding, tattoo imagery, photography and client-supplied content remain associated with Divine Tattoo and/or their respective rights holders.

The website implementation and technical integration were developed and maintained through the Zyberlane project workflow. This repository should not be interpreted as transferring ownership of client trademarks, artwork or photography.

## Third-Party Services

Supabase, Vercel and any other third-party software or services used by the project remain subject to their own licenses, terms and policies.

## Copyright and License

No repository-wide open-source license is provided.

Public visibility of this source does not by itself grant permission to reuse the client brand, tattoo artwork, photography, website-specific design or other protected content. Third-party software and assets retain their original licenses and ownership.
