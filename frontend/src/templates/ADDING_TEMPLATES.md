# Adding a personal brand template

Each template lives in its own folder and component file:

```text
templates/
  TemplateA/TemplateA.jsx
  TemplateB/TemplateB.jsx
  TemplateC/TemplateC.jsx
  TemplateD/TemplateD.jsx
```

To add another template:

1. Create `TemplateD/TemplateD.jsx` and compose it from the shared sections in
   `PortfolioSections.jsx`.
2. Add its stable `id`, display name, short description, and component to
   `registry.js`.
3. Add the same id to the backend template enum and validation, and define its
   visual styles in `style.css`.

Keep a template id stable after users have selected it; saved personal brands
refer to that id.

## Modern Studio

The `modern` template lives in `ModernStudio/` with scoped styles. It uses the existing portfolio fields, supports category-specific details, and hides empty sections. Optional profile and project images use HTTP(S) URLs with graphic fallbacks. No migration is required. Select **Modern Studio** in **Choose a look**.

Register new metadata in `templateDefinitions.js` and map its id to a component in `registry.js`. Add the id to the backend model, request validation, template selection and publish checks. Keep legacy ids supported.

## Paid animated templates

Aurora Motion (`aurora`) and Kinetic Studio (`kinetic`) each use **`animatedTemplatePrice` from `backend/.env`, once per account per template**. The server reads this price dynamically through `backend/src/config/templates.js`; checkout never accepts a client-supplied price. Free previews do not change the saved template. A template purchase is separate from the existing publishing subscription.

Paid access is stored in `TemplatePurchase`. Selection, profile updates, manual publishing, automatic publishing, and both public portfolio routes enforce access. A verified captured payment must match the stored order, amount and currency. Razorpay's `payment.captured` webhook also completes purchases when the browser callback is missed; repeated callbacks are idempotent. Purchases appear in billing history.

Use the existing Razorpay key ID, secret and signed webhook configuration for real payments. The existing development simulation flag enables simulated template purchases only outside production. No real payment is required for tests. To verify locally, run `npm test` and `npm run build`.

Both designs include a pause control and respect the device's reduced-motion preference. The original templates remain available without an additional template fee.

### Additional animated designs

- **Opal Glass** (`opal`): pastel glass panels, an iridescent identity card and soft floating light.
- **Noir Atelier** (`noir`): centered serif hero, portrait medallion, gold glow and monochrome work cards.
- **Terra Bloom** (`terra`): sage and terracotta, organic arch shapes and slow botanical motion.

Each uses the same environment-configured one-time price and server-side access checks. Their scoped styles are in `Animated/aesthetic-templates.css`. All retain pause controls, reduced-motion support and category-specific content.
