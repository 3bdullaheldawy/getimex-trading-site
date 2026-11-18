# Getimex General Trading L.L.C.

Independent Next.js website for Getimex, built from the approved company structure and visual direction.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000/en` or `http://localhost:3000/ar`.

The project includes the public marketing site, bilingual routing, product detail pages, a validated quotation API, and a protected Phase 3 CMS at `/admin`.

## Environment

Copy `.env.example` to `.env.local` and provide Neon, Auth.js and (when media uploads are needed) Vercel Blob values. Public catalogue pages retain the approved content snapshot when the database is unavailable; inquiries, analytics and all admin operations fail closed until PostgreSQL is configured.

## Phase 3 setup

```bash
npx prisma generate
npx prisma migrate deploy
$env:SEED_ADMIN_EMAIL="admin@getimex.com"
$env:SEED_ADMIN_PASSWORD="use-a-long-unique-password"
npx prisma db seed
```

Required production values are `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `BLOB_READ_WRITE_TOKEN`, `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_WHATSAPP_NUMBER`. The seed reads the initial admin credentials from environment variables and never stores them in the repository.

## Build verification

```bash
node node_modules/next/dist/bin/next build
```

The build is type-checked and statically validates all public routes.
