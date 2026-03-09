# MeshWire

Single-page landing site for `meshwire.com`, built with Next.js App Router and Tailwind CSS.

## Links

- Live: https://meshwire.vercel.app
- Repository: https://github.com/aryannpanwarr/MeshWire

## Local development

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Waitlist handling

The waitlist form posts to `app/api/waitlist/route.ts`.

- Preferred path: set `RESEND_API_KEY` and `RESEND_FROM` to relay submissions by email to `aryannpanwarr@gmail.com`.
- Fallback path: if `RESEND_API_KEY` is missing or the email relay fails, submissions are appended locally to `data/waitlist-submissions.ndjson`.

Copy `.env.example` to `.env.local` and fill in the values you want to use.

## Deploy

Deploy with Vercel:

```bash
npm run build
```

Before deploying, set these environment variables in Vercel if you want live email delivery:

- `RESEND_API_KEY`
- `RESEND_FROM`
- `NEXT_PUBLIC_GITHUB_URL`
- `NEXT_PUBLIC_X_URL`
