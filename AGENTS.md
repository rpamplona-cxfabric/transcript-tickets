<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Application code conventions

- Keep each private route page minimal. A route's non-reusable implementation
  belongs in that route's `_components/` directory. This applies to every
  nested page route as well; do not place a child page's implementation in its
  parent route's `_components/` directory.
- Put reusable, cross-feature UI in `src/components/`; do not duplicate shared
  components inside route folders.
- Keep one React component per file.
- Use ES6 arrow-function components everywhere except Next.js `page.tsx` and
  `layout.tsx` files, which may use default function exports.
- When a component has substantial state, side effects, queries, mutations, or
  other long-running logic, use a folder structure such as
  `_components/example/index.tsx` and `_components/example/hook.ts`. The
  `index.tsx` component should use the hook and focus on presentation.
- Use full Tailwind utility classes for styling. Keep styling consistent with
  existing shared primitives rather than introducing ad-hoc CSS.

## Data, forms, and API conventions

- Zustand is the client-side source of truth for fetched and interactive data.
  Populate the appropriate store after fetching and have client components read
  from that store.
- Use Axios for HTTP requests and TanStack Query for request/mutation lifecycle
  management where asynchronous client operations are needed.
- Build every form with React Hook Form and Zod validation.

## Completion checklist

- Run `npm run format` after every code update so Prettier formats the entire
  codebase.
