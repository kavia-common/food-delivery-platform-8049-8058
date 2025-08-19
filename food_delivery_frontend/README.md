# Food Delivery Frontend (Next.js)

Modern, clean UI for browsing restaurants, placing orders, payments (mock intent), and delivery tracking.

## Setup

1) Copy env and set backend URLs:
```
cp .env.example .env.local
```
Edit `.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_WS_BASE_URL=ws://localhost:3001
```

2) Install and run:
```
npm install
npm run dev
```
Then open http://localhost:3000.

## Features

- Header navigation (Discover, Orders, Tracking) with auth modals (Sign in/Register).
- Restaurant search and filters (query, cuisine, open, min rating).
- Restaurant details and menu browsing.
- Cart with quantity controls and order notes/address.
- Order placement and payment intent creation.
- Order history panel and page.
- Delivery tracking page with REST status fetch and WebSocket live updates (demo).
- Responsive design using Tailwind CSS utilities.

## Notes

- Authentication uses OAuth2 password flow from backend; tokens are stored in localStorage and attached to authorized endpoints.
- Payment is a mock "intent" creation to demonstrate flow.
- Tracking WebSocket URL is derived from `NEXT_PUBLIC_WS_BASE_URL` and `order_id`.

## Scripts

- `npm run dev` start dev server
- `npm run build` build
- `npm start` production start
- `npm run lint` lint

## Project structure

- `src/lib/api.ts` REST API wrappers with types.
- `src/lib/cart.tsx` cart provider and hooks.
- `src/components/*` UI components.
- `src/app/*` pages using Next.js App Router.

