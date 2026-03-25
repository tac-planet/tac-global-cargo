# TAC Global Cargo Enterprise Portal

A full-stack logistics management system built with **Next.js 16**, **React 19**, **Supabase**, and **TypeScript**.

## Tech Stack

- **Framework**: Next.js 16.2.1 (App Router)
- **UI**: Tailwind CSS v4, shadcn/ui, Radix UI, Lucide Icons
- **State**: Zustand (auth), TanStack React Query v5 (server state)
- **Backend**: Supabase (Postgres, Auth, RLS, Realtime, Edge Functions)
- **Rich Text**: Tiptap
- **Charts**: Recharts
- **Barcode**: @zxing/browser
- **PDF**: jsPDF + jspdf-autotable
- **Testing**: Jest + React Testing Library (unit), Playwright (E2E)

## Features

- Role-based authentication (Admin, Manager, Ops, Viewer)
- Real-time shipment, manifest, invoice, and exception tracking
- Barcode/QR code scanning for warehouse operations
- PDF report generation for shipments, invoices, and manifests
- Supabase Realtime subscriptions for live data updates
- Edge Functions for automated status workflows
- Responsive dashboard with KPI cards, data tables, and charts

## Getting Started

```bash
npm install
cp .env.example .env.local  # Add your Supabase keys
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm test` | Run unit tests |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run lint` | ESLint check |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
