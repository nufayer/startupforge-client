# TODO - Fix Authentication (better-auth + MongoDB)

- [ ] Identify why signIn/signUp fails by checking better-auth configuration + handler wiring.
- [ ] Fix server-side auth route configuration for Next.js App Router.
- [ ] Fix client-side auth initialization (createAuthClient) usage for Next.js.
- [ ] Add missing exports/option configuration if required by better-auth.
- [ ] Verify required environment variables are used/guarded (MONGO_DB_URI, AUTH_DB_NAME).
- [ ] Run `npm run dev` and test signup/login flows.
- [ ] (If still failing) inspect network requests to `/api/auth/*` and check error messages.

