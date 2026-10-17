# Personal Branding — Build Your Digital Identity

Independent local first portfolio SaaS for Prakash SaaS. New accounts start from the login page with Google sign-in. After Google verifies the account email, first-time users set a password on `/register`; there is no email OTP flow. Returning users can sign in with Google or their saved email/password. The Clinic SaaS reference review is in [`docs/CLINIC_REFERENCE_ANALYSIS.md`](docs/CLINIC_REFERENCE_ANALYSIS.md). Clinic source is preserved under ignored `_reference/` for this local workspace; the new application does not import it.

## Local setup

Requirements: Node.js 20+ and MongoDB Community or a MongoDB Atlas URI.

1. Copy `backend/.env.example` to `backend/.env` and `frontend/.env.example` to `frontend/.env`. Set a long random `JWT_SECRET`, `MONGO_URI`, and matching Google OAuth client IDs. Configure `PUBLIC_NUMBER` and `PUBLIC_EMAIL` for the landing-page footer, and `PRIVATE_NUMBER` and `PRIVATE_EMAIL` for paid customer support.
2. For offline checkout flow only, set `PAYMENT_SIMULATION_ENABLED=true` while `NODE_ENV=development`. Simulation is explicitly labeled, omitted in production, and disabled by default.
3. Google sign-in is required to create a new account: set the same OAuth client id in backend `GOOGLE_CLIENT_ID` and frontend `VITE_GOOGLE_CLIENT_ID`. Google credentials and authorized JavaScript origins must be configured in Google Cloud Console. The backend verifies Google's ID token and verified-email claim before account creation. No email OTP provider is used.
4. Optional Razorpay Test Mode: set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`; leave simulation disabled.
5. From the project root:

```sh
npm install
npm --prefix frontend install
npm --prefix backend install
npm run dev
```

Frontend: http://localhost:5173 · API health: http://localhost:5000/api/health

`npm run dev` launches the Vite frontend and Express backend. Root dependencies include `concurrently`.

## Local portfolio URLs

- Reliable route: `http://localhost:5173/p/yourusername`
- Local host alias: `http://yourusername.localhost:5173` (browser support may vary)

The configured public suffix comes from `PUBLIC_BASE_DOMAIN` in `backend/.env` and is used for profile previews and canonical URLs. Production wildcard subdomains need a matching DNS record, TLS, reverse proxy/host routing, and application origin/cookie configuration. `APP_BASE_DOMAIN=localhost` can remain set for local host routing.

## Billing model

Two backend-configured plans are available: 3 months (90 days) and 1 year (365 days). Set `PLAN_3_MONTHS_AMOUNT`, `PLAN_1_YEAR_AMOUNT`, and `PLAN_CURRENCY` in `backend/.env`; both amounts are in the configured currency. A plan with amount `0` is displayed as not configured and cannot be checked out. Razorpay uses one-time Orders with server-side HMAC checkout verification and raw-body webhook signature validation. A verified payment grants the selected fixed entitlement period; this implementation does not claim native recurring Razorpay Subscriptions. Renewal creates another order, with subscription history retained.

The public landing-page footer reads `PUBLIC_NUMBER` (international format) and `PUBLIC_EMAIL`. Paid customers see the private support contacts after publishing; set `PRIVATE_NUMBER` and `PRIVATE_EMAIL` for those. Keep public and private contacts separate in Render and local environment settings.

## Security and data

Passwords use bcrypt. Sessions use HS256 JWTs in HttpOnly cookies; backend resolves ownership from the authenticated account. Mongoose unique indexes handle username races; reserved names are centrally configured. Publishing is backend gated on required profile fields and an active term. Public reads return only published portfolios and remove owner ids; private contact number is only rendered when the explicit show setting is enabled. Helmet, strict credentialed CORS origin, JSON limits, and auth rate limiting are enabled. Local uploads and rich media management are not yet implemented; image URL fields exist in the portfolio schema but should not be treated as secure upload support.

## Verification commands

```sh
npm run build
npm --prefix backend test
npm --prefix frontend test
```

Some flows require MongoDB or Razorpay/Google credentials. The development simulation is not a real payment. Tests/build results must be reported based on actual execution.

## MVP scope and current limits

Implemented paths include Google-first account creation, a password setup step for new Google users, login/logout, a persisted portfolio profile wizard with required name/phone and skippable optional steps, server-checked username selection, three template renderers, desktop/tablet/mobile preview widths, owner scoped editing, backend gated automatic publishing after successful payment, local `/p/:username` and `<username>.localhost` views, basic aggregated daily views, plan checkout configuration, optional guarded simulated checkout, Razorpay Orders/signature/webhook endpoints, and billing history.

The following production-oriented requirements remain incomplete and need implementation or integration before launch:

- Mongo-backed end-to-end workflows have not been exercised in this workspace because MongoDB is not installed/running and no `.env` credentials are present.
- No secure media upload/storage adapter or image upload UI; only image URL fields are modeled.
- Public-page metadata is updated client-side. Social crawler HTML rendering/SSR, OG image generation and an XML sitemap are not implemented; client metadata alone does not guarantee social preview indexing.
- The current paid term is a one-time fixed-duration entitlement, not auto-renewing. Renewal is another payment order; cancellation-at-period-end/refund policy workflows and failure reconciliation/support tooling are not built.
- Google OAuth and live Razorpay need provider credentials and were not verified. Razorpay webhook duplicate processing is idempotent by recorded event/payment marker, but broader recovery and dispute operations from the clinic reference are not ported.
- Automated tests currently cover username canonicalization/reserved names, public contact projection and the template registry. Authentication, ownership integration, payment provider signatures/webhooks and responsive breakpoints need additional tests.
- Rate limiting currently covers auth routes. Production deployment still needs deployment-specific TLS, trusted proxy, API hostname, secure cookie, CSRF review, DNS/subdomain routing and monitoring configuration.

This project is a local MVP foundation, not a verified production release.

### Animated template purchases

Aurora Motion and Kinetic Studio are optional animated designs, priced using **`animatedTemplatePrice` in `backend/.env` (INR, one-time per template)**. Users can preview them for free; server-verified payment unlocks selection. Publishing still requires an active publishing subscription. Live payments use the existing Razorpay keys and signed `payment.captured` webhook. Development simulation is blocked in production, and simulated template purchases do not unlock production access.

Run `npm test` for template entitlement, payment validation, webhook replay, renderer and legacy compatibility checks. Live gateway checkout has not been exercised by these tests.

Set `animatedTemplatePrice=5` in `backend/.env` (INR per template, at least 1, up to two decimal places). Restart the backend after editing the file. Catalog prices and new orders use this value; existing orders retain their original amount. Missing or invalid values disable new purchases without affecting existing ownership.

### Password recovery

Use **Forgot password?** on the login page, or **Reset password** in Settings. Verify the same Google identity used to create the account, then enter and confirm a new password. Password fields have explicit Show/Hide controls; saved passwords are never revealed.

Recovery uses the existing `GOOGLE_CLIENT_ID` / `VITE_GOOGLE_CLIENT_ID` configuration and does not require email delivery. Only verified, matching Google accounts can start a reset. The HttpOnly reset cookie expires after 15 minutes; only its SHA-256 hash is stored. Reset tokens are single-use, password updates use bcrypt, and token-version changes invalidate prior login and setup sessions. Google account creation and normal login behavior are preserved.

### Subscription landing and validity renewal

Returning email/password and Google logins open `/app?tab=subscription`. New account password setup continues to the onboarding workspace.

The Subscription tab displays a live validity countdown and an **Upgrade validity** button when fewer than 30 days remain (also available after expiry). It uses the same server-configured 90-day and 365-day plans shown during publishing. A future expiry is extended by the purchased duration; an expired plan starts from the verified payment time. The screen previews the resulting expiry before checkout.

Subscription selection prefers active paid validity over newer pending orders. Verification, development simulation and signed capture webhooks use the same activation service. `SubscriptionTerm` stores one validity ledger per owner with a unique owner index and applied order IDs, so repeated callbacks do not add days again and distinct simultaneous renewals accumulate. Existing active subscriptions seed this ledger on first renewal; historic paid orders are not reapplied. Do not disable the unique owner index in production.

Automated checks and local payment simulation cover renewal arithmetic, the 30-day boundary, expired plans, pending checkout visibility and callback replay. Real gateway renewal has not been exercised by these tests.
