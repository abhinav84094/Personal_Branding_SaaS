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
