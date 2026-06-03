# AGENTS.md

Use this file as the lightweight rule set for this repo. Follow `DESAFIO.md` for product requirements.

## Core Rules

- Use TypeScript only.
- Keep code explicit, simple, and testable.
- Prefer small focused modules over large files.
- One responsibility per function and per module.
- Use early returns and guard clauses.
- Avoid deep nesting. Keep complexity low.
- Name things by intent, not by type or shape.
- Boolean names should read as predicates: `isActive`, `hasToken`, `canSell`.
- Avoid abbreviations unless they are standard in the domain.

## TypeScript

- Keep `strict` typing intact.
- Do not use `any`.
- Avoid untyped functions and implicit `any`.
- Use explicit types for inputs, outputs, and shared contracts.
- Validate external input with `zod`.
- Do not pass raw objects across layers when a typed contract is better.
- Avoid dynamic property access, `getattr`-style patterns, and runtime type guessing in core logic.

## Architecture

- Keep domain logic free from HTTP, DB, filesystem, and transport concerns.
- Isolate external I/O behind adapters or services.
- Do not call DB or external APIs directly from business rules.
- Keep time, randomness, and external calls injectable.
- Prefer deterministic functions when possible.
- Avoid hidden state.
- Use transactions for critical flows such as sales, stock, and cash movement.

## Backend

- Backend stack: Node.js, Express, Prisma.
- Keep handlers thin: validate, call use case, map response.
- Centralize error handling in a global handler.
- Use middleware for auth and role checks.
- Keep JWT, refresh token, and authorization out of business rules.
- Use soft delete when the domain requires deactivation without losing history.
- Keep validations strict for email, password, EAN, price, quantity, and status.

## Frontend

- Frontend stack: Next.js App Router, React Hook Form, Zod, Tailwind, shadcn/ui, Zustand when needed.
- Preserve existing project conventions and the Next.js version in this repo.
- Keep UI components presentational when possible.
- Keep state, data fetching, and form validation separated.
- Centralize API client and interceptors.
- Protect routes and screens by session and role.

## Testing

- Test critical backend flows: login, refresh, authorization, CRUD, stock, and sales.
- Prefer integration tests for routes and critical services.
- Add or update tests when fixing bugs.
- Keep test fixtures explicit.

## Code Quality

- Do not duplicate validation or business rules.
- Prefer clarity over cleverness.
- Split code when a function grows beyond its responsibility.
- Keep files under control; split by responsibility before they become large.
- Do not change unrelated files.
- Do not revert user changes.
