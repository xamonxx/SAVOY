# SAVOY

Independent SAVOY website built from a proven Next.js App Router foundation and rebuilt for the SAVOY / Quiet Spatial Luxury brand.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Motion for interface transitions
- GSAP + `@gsap/react` for hero/process choreography
- React Hook Form + Zod for the consultation planner
- Sharp-powered local image variant pipeline

## Development

```bash
npm install
npm run dev
```

## Quality Gates

```bash
npm run lint
npm run typecheck
npm run build
```

## Environment

Copy `.env.example` to `.env.local` and fill only verified SAVOY business values. Contact, location, social, and webhook values are intentionally blank until confirmed.

## Asset Rules

SAVOY brand assets live in `public/brand`. Project photography, testimonials, addresses, and business facts must not be invented. Use `PROJECT_DATA_REQUIRED`, `TESTIMONIAL_DATA_REQUIRED`, or `BUSINESS_DATA_REQUIRED` until verified data is supplied.

## Animation Architecture

GSAP is limited to hero reveal and process scroll progress. Motion handles service selection, material transitions, FAQ disclosure, and small layout states.
