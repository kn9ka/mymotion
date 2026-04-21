# mymotion

Personal portfolio site for [knyaka.dev](https://knyaka.dev).

The app is no longer a Next.js project. The repository now contains a React Router 7 app in framework mode with SSR enabled, built on top of Vite, Tailwind CSS v4, Framer Motion, and a small shared UI layer.

## What is in the app

- Full-page landing section with a WebGL smoke canvas background
- Animated floating navigation with section anchors
- Theme toggle with persisted light/dark preference
- Experience, side projects, gaming, and social sections
- Custom animated 404 page

## Stack

- React 19
- React Router 7 (`appDirectory: ./src/app`, `ssr: true`)
- Vite 8
- Tailwind CSS 4
- Framer Motion
- shadcn/ui primitives
- TypeScript

## Project structure

```text
src/
  app/
    providers/   # app-level wrappers
    routes/      # route entry points
    root.tsx     # document layout + outlet
  pages/
    index/       # homepage sections and WebGL scene
    not-found/   # 404 page
  shared/
    lib/         # theme and utility helpers
    ui/          # reusable UI components
```

## Getting started

This repository uses `npm` and ships with a `package-lock.json`.

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Available scripts

- `npm run dev` - start the local development server
- `npm run build` - build client and server bundles into `build/`
- `npm run build:dev` - build in development mode
- `npm run lint` - run `oxlint`
- `npm run lint:style` - run Stylelint for CSS files
- `npm run types` - generate React Router types and run type-aware checks
- `npm run fmt` - format the codebase with `oxfmt`
- `npm run upgrade-interactive` - interactively update dependencies

## Verified commands

The following commands were verified successfully against the current codebase on April 21, 2026:

- `npm run build`
- `npm run lint`
- `npm run types`

## Notes

- The current `README` now reflects the actual React Router/Vite codebase in `src/`.
- `build/` contains both client and server output.
- Production runs with `react-router-serve build/server/index.js`.
- `GET /health` returns `200 OK` with `text/plain` for container health checks.
