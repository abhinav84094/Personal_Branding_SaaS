import React, { useEffect, useState } from "react";
import { Link, Route, Routes, useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Menu,
  Globe,
  Eye,
  Layers,
  Monitor,
  Tablet,
  Smartphone,
} from "lucide-react";
import api from "./api.js";
import { PortfolioView, templates } from "./templates/PortfolioView.jsx";
import {
  AnalyticsPanel,
  BillingHistory,
} from "./components/WorkspaceExtras.jsx";
import PricingPlans from "./components/PricingPlans.jsx";
import SupportContacts from "./components/SupportContacts.jsx";
function Brand() {
  return (
    <Link className="brand" to="/">
      <b>p.</b> prakash<span>saas</span>
    </Link>
  );
}
function Landing() {
  const [offers, O] = useState([]);
  const [publicDomain, PD] = useState("localhost");
  const [support, setSupport] = useState({
    displayNumber: "",
    whatsappNumber: "",
    email: "",
  });
  useEffect(() => {
    api
      .get("/config")
      .then((r) => {
        O(r.data.plans || []);
        PD(r.data.publicBaseDomain || "localhost");
        setSupport(
          r.data.support || {
            displayNumber: "",
            whatsappNumber: "",
            email: "",
          },
        );
      })
      .catch(() => {});
  }, []);
  return (
    <>
      <nav className="nav">
        <Brand />
        <div>
          <a href="#features">Features</a>
          <a href="#templates">Templates</a>
          <a href="#pricing">Pricing</a>
        </div>
        <div>
          <Link to="/login">Log in</Link>
          <Link className="btn dark" to="/login">
            Get started ↗
          </Link>
        </div>
      </nav>
      <section className="hero">
        <div>
          <small className="eyebrow">YOUR NEXT CHAPTER, ONLINE</small>
          <h1>
            Your story
            <br />
            deserves a <i>website.</i>
          </h1>
          <p>
            Build your personal brand, showcase your work, and grow your digital
            identity — without writing code.
          </p>
          <Link className="btn dark" to="/login">
            Build your personal brand →
          </Link>{" "}
          <a className="btn light" href="#templates">
            Explore templates ↘
          </a>
          <div className="proof">
            ✳ Made for designers, developers, creators & curious people.
          </div>
        </div>
        <div className="hero-card">
          <div className="browser">
            ● ● ● <span>rahul.{publicDomain}</span>
          </div>
          <div className="mock">
            <small>DESIGNER · DEVELOPER</small>
            <h2>
              Crafting digital
              <br />
              <i>experiences.</i>
            </h2>
            <p>Thoughtful ideas, made useful for the web.</p>
            <button>Explore my work ↗</button>
            <div className="portrait">SELECTED WORK · 2026</div>
          </div>
        </div>
      </section>
      <section className="trust">
        <small>MADE FOR PEOPLE WHO MAKE THINGS</small>
        <div>
          Designers　 ·　 Developers　 ·　 Creators　 ·　 Freelancers　 ·　
          Students
        </div>
      </section>
      <section id="features" className="section">
        <small className="eyebrow">A LITTLE MORE YOU</small>
        <h2>
          Everything you need
          <br />
          to <i>show up well.</i>
        </h2>
        <div className="feature-grid">
          {[
            [
              "Design that starts with your story.",
              "Pick a visual style, add your details once, and make it yours.",
            ],
            [
              "From blank page to published.",
              "A guided setup helps you get the important bits in place.",
            ],
            [
              "A link you’ll love to share.",
              "Give your work a home at your own personal address.",
            ],
          ].map(([h, p], i) => (
            <article key={h}>
              <span className="feature-icon">
                {[<Layers />, <Check />, <Eye />][i]}
              </span>
              <small>0{i + 1} — MADE FOR YOU</small>
              <h3>{h}</h3>
              <p>{p}</p>
            </article>
          ))}
        </div>
      </section>
      <section id="templates" className="section tinted">
        <small className="eyebrow">THREE WAYS TO BE YOU</small>
        <h2>
          Find your kind of <i>different.</i>
        </h2>
        <div className="template-grid">
          {templates.map((t, i) => (
            <Link to="/login" className={"template-tile " + t.id} key={t.id}>
              <div className="tile-preview">
                <small>0{i + 1} / TEMPLATE</small>
                <h3>
                  {i === 0 ? (
                    <>
                      A thoughtful
                      <br />
                      <i>creative.</i>
                    </>
                  ) : i === 1 ? (
                    <>
                      Building things
                      <br />
                      <em>for the web.</em>
                    </>
                  ) : (
                    <>
                      Ideas into
                      <br />
                      <i>something.</i>
                    </>
                  )}
                </h3>
                <span>DESIGNER · MAKER · CREATOR</span>
              </div>
              <b>{t.name}</b>
              <p>
                {t.copy} <span>↗</span>
              </p>
            </Link>
          ))}
        </div>
        <p className="template-coming-soon">More templates coming soon.</p>
      </section>
      <section className="section steps">
        <div>
          <small className="eyebrow">A FEW EASY STEPS</small>
          <h2>
            Good things can
            <br />
            start <i>today.</i>
          </h2>
          <p>Start with your name, add what matters, and make it yours.</p>
          <Link className="btn dark" to="/login">
            Get started for free →
          </Link>
        </div>
        <ol>
          <li>
            <b>01</b>
            <span>
              <strong>Tell us a little about you</strong>
              <small>Your name and number are enough to begin.</small>
            </span>
            <Check />
          </li>
          <li>
            <b>02</b>
            <span>
              <strong>Make it feel like you</strong>
              <small>Add your work and pick a look.</small>
            </span>
            <Check />
          </li>
          <li>
            <b>03</b>
            <span>
              <strong>Put your name on it</strong>
              <small>Subscribe when you’re ready to publish.</small>
            </span>
            <Check />
          </li>
        </ol>
      </section>
      <section id="pricing" className="pricing section">
        <small className="eyebrow">CHOOSE YOUR PLAN</small>
        <h2>
          A home for your work.
          <br />
          <i>All yours.</i>
        </h2>
        <p>
          Create and preview for free. Subscribe when you’re ready to publish.
        </p>
        <PricingPlans plans={offers} publicMode />
        <small className="pricing-note">
          No charge to get started. Pay only when you are ready to publish.
        </small>
      </section>
      <section className="last">
        <small className="eyebrow">YOU’RE ALREADY SOMEWHERE</small>
        <h2>
          Make it easier for the world
          <br />
          to <i>find you.</i>
        </h2>
        <Link className="btn light" to="/login">
          Start your personal brand →
        </Link>
      </section>
      <footer>
        <div className="landing-footer-main">
          <div className="landing-footer-brand">
            <Brand />
            <span>Build your digital identity.</span>
          </div>
          <nav className="landing-footer-nav" aria-label="Footer navigation">
            <a href="#features">Features</a>
            <a href="#templates">Templates</a>
            <a href="#pricing">Pricing</a>
            <Link to="/login">Log in</Link>
          </nav>
          <div className="landing-footer-links">
            <strong>Need help?</strong>
            {support.whatsappNumber && (
              <a
                href={`https://wa.me/${support.whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp {support.displayNumber}
              </a>
            )}
            {support.email && (
              <a href={`mailto:${support.email}`}>{support.email}</a>
            )}
            {!support.whatsappNumber && !support.email && (
              <small>Contact details coming soon.</small>
            )}
          </div>
        </div>
        <div className="landing-footer-bottom">
          <small>
            © {new Date().getFullYear()} Prakash SaaS. All rights reserved.
          </small>
          <a href={`https://${publicDomain}`}>
            prakashsaas.com <ArrowUpRight size={13} />
          </a>
        </div>
      </footer>
    </>
  );
}
function GoogleSignIn({ onError }) {
  const ref = React.useRef(null);
  useEffect(() => {
    const id = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!id) return;
    const draw = () => {
      if (!window.google || !ref.current) return;
      window.google.accounts.id.initialize({
        client_id: id,
        callback: async (x) => {
          try {
            const result = await api.post("/auth/google", {
              credential: x.credential,
            });
            location.assign(result.data.needsPassword ? "/register" : "/app");
          } catch (e) {
            onError(e.response?.data?.message || "Google sign-in failed.");
          }
        },
      });
      window.google.accounts.id.renderButton(ref.current, {
        theme: "outline",
        size: "large",
        shape: "rectangular",
        width: 340,
        text: "continue_with",
      });
    };
    let s = document.querySelector("#google-identity");
    if (!s) {
      s = document.createElement("script");
      s.id = "google-identity";
      s.src = "https://accounts.google.com/gsi/client";
      s.onload = draw;
      document.head.append(s);
    } else draw();
  }, []);
  return import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
    <div className="google-signin" ref={ref} />
  ) : null;
}
function LoginPage() {
  const nav = useNavigate(),
    [f, F] = useState({ email: "", password: "" }),
    [err, E] = useState("");
  async function submit(e) {
    e.preventDefault();
    try {
      await api.post("/auth/login", f);
      nav("/app");
    } catch (x) {
      E(x.response?.data?.message || "Email or password is incorrect.");
    }
  }
  return (
    <div className="auth">
      <Brand />
      <form onSubmit={submit}>
        <small className="eyebrow">WELCOME TO YOUR NEXT CHAPTER</small>
        <h1>Sign in to your space.</h1>
        <p>
          New here? Continue with Google. We’ll help you finish setting up your
          account.
        </p>
        <label>
          Email address
          <input
            type="email"
            autoComplete="email"
            required
            value={f.email}
            onChange={(e) => F({ ...f, email: e.target.value })}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete="current-password"
            required
            value={f.password}
            onChange={(e) => F({ ...f, password: e.target.value })}
          />
        </label>
        {err && (
          <p className="error" role="alert">
            {err}
          </p>
        )}
        <button className="btn dark">Log in →</button>
        <div className="or-divider">
          <span>OR CONTINUE WITH GOOGLE</span>
        </div>
        <GoogleSignIn onError={E} />
      </form>
    </div>
  );
}
function PasswordSetupPage() {
  const nav = useNavigate(),
    [user, U] = useState(null),
    [password, P] = useState(""),
    [confirm, C] = useState(""),
    [err, E] = useState(""),
    [busy, B] = useState(false);
  useEffect(() => {
    api
      .get("/auth/password-setup")
      .then((r) => U(r.data.user))
      .catch(() => nav("/login", { replace: true }));
  }, []);
  async function submit(e) {
    e.preventDefault();
    E("");
    if (password !== confirm) {
      E("Passwords do not match.");
      return;
    }
    B(true);
    try {
      await api.post("/auth/set-password", { password });
      nav("/app", { replace: true });
    } catch (x) {
      E(x.response?.data?.message || "Could not save your password.");
    } finally {
      B(false);
    }
  }
  if (!user)
    return (
      <div className="loading">
        <Brand />
        <p>Checking your Google sign-in...</p>
      </div>
    );
  return (
    <div className="auth password-setup-screen">
      <div className="password-setup-backdrop" aria-hidden="true">
        <LoginPage />
      </div>
      <div className="password-setup-shade" />
      <form
        className="password-setup-dialog"
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="password-setup-title"
      >
        <small className="eyebrow">ONE LAST STEP</small>
        <h1 id="password-setup-title">Add a password.</h1>
        <p>
          Google verified {user.email}. Choose a password for your account. Next
          time, you can sign in with this email and password.
        </p>
        <label>
          Password
          <input
            autoComplete="new-password"
            type="password"
            minLength="8"
            maxLength="128"
            required
            value={password}
            onChange={(e) => P(e.target.value)}
          />
        </label>
        <label>
          Confirm password
          <input
            autoComplete="new-password"
            type="password"
            required
            value={confirm}
            onChange={(e) => C(e.target.value)}
          />
        </label>
        {err && (
          <p className="error" role="alert">
            {err}
          </p>
        )}
        <button className="btn dark" disabled={busy}>
          {busy ? "Saving..." : "Set password and continue →"}
        </button>
      </form>
    </div>
  );
}
const steps = [
  "Overview",
  "About you",
  "Your story",
  "Your work",
  "Links",
  "Your address",
  "Choose a look",
  "Preview",
  "Publish",
  "Analytics",
  "Subscription",
  "Billing History",
  "Settings",
];
function Entry({ name, list, change, project = false }) {
  return (
    <fieldset>
      <legend>
        {name} <small>Optional</small>
      </legend>
      {list.map((v, i) => (
        <div className="entry" key={i}>
          <input
            placeholder="Title"
            value={v.title || ""}
            onChange={(e) =>
              change(
                list.map((x, n) =>
                  i === n ? { ...x, title: e.target.value } : x,
                ),
              )
            }
          />
          <input
            placeholder={project ? "Technologies" : "Organisation"}
            value={
              project ? (v.technologies || []).join(", ") : v.institution || ""
            }
            onChange={(e) =>
              change(
                list.map((x, n) =>
                  i === n
                    ? project
                      ? {
                          ...x,
                          technologies: e.target.value
                            .split(",")
                            .map((a) => a.trim())
                            .filter(Boolean),
                        }
                      : { ...x, institution: e.target.value }
                    : x,
                ),
              )
            }
          />
          <textarea
            placeholder="A short description"
            value={v.description || ""}
            onChange={(e) =>
              change(
                list.map((x, n) =>
                  i === n ? { ...x, description: e.target.value } : x,
                ),
              )
            }
          />
          {project && (
            <>
              <input
                placeholder="Live URL"
                value={v.liveUrl || ""}
                onChange={(e) =>
                  change(
                    list.map((x, n) =>
                      i === n ? { ...x, liveUrl: e.target.value } : x,
                    ),
                  )
                }
              />
              <input
                placeholder="GitHub URL"
                value={v.githubUrl || ""}
                onChange={(e) =>
                  change(
                    list.map((x, n) =>
                      i === n ? { ...x, githubUrl: e.target.value } : x,
                    ),
                  )
                }
              />
            </>
          )}
          <button
            type="button"
            className="remove"
            onClick={() => change(list.filter((_, n) => n !== i))}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        className="textbtn"
        onClick={() =>
          change([
            ...list,
            { title: "", description: "", institution: "", technologies: [] },
          ])
        }
      >
        + Add {project ? "project" : "entry"}
      </button>
    </fieldset>
  );
}
function SavedStepSummary({ step, portfolio, onEdit, onNext }) {
  const profile = portfolio.profile || {};
  const groups = {
    1: [
      ["Full name", profile.fullName],
      ["Contact number", profile.contactNumber],
      ["Professional title", profile.title],
      ["Location", profile.location],
      ["Public email", profile.email],
      ["Introduction", profile.intro],
      ["About", profile.bio],
      ["Contact display", profile.showContact ? "Visible publicly" : "Private"],
    ],
    2: [
      ["Skills", (portfolio.skills || []).join(", ")],
      ...["education", "experience", "certifications"].map((group) => [
        group[0].toUpperCase() + group.slice(1),
        (portfolio[group] || [])
          .map((item) =>
            [
              item.title,
              item.institution,
              item.startDate,
              item.endDate,
              item.description,
              item.technologies?.join(", "),
            ]
              .filter(Boolean)
              .join(" · "),
          )
          .filter(Boolean)
          .join("\n"),
      ]),
    ],
    3: [
      [
        "Projects",
        (portfolio.projects || [])
          .map((project) =>
            [
              project.title,
              project.description,
              project.liveUrl,
              project.githubUrl,
              project.technologies?.join(", "),
            ]
              .filter(Boolean)
              .join(" · "),
          )
          .filter(Boolean)
          .join("\n"),
      ],
    ],
    4: Object.entries(portfolio.socials || {}).map(([network, url]) => [
      network,
      url,
    ]),
  };
  const rows = (groups[step] || []).filter(([, value]) => value);

  return (
    <section className="panel saved-step-panel">
      <div className="saved-step-heading">
        <div>
          <span className="saved-step-status">SAVED</span>
          <h2>Your information</h2>
          <p>Review what you added. You can edit it anytime.</p>
        </div>
        <button className="btn saved-edit-btn" onClick={onEdit}>
          Edit
        </button>
      </div>
      {rows.length ? (
        <dl className="saved-step-list">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="saved-step-empty">Nothing added in this step yet.</p>
      )}
      <div className="saved-step-actions">
        <button className="btn dark" onClick={onNext}>
          Next step →
        </button>
      </div>
    </section>
  );
}
function Workspace() {
  const nav = useNavigate(),
    [p, P] = useState(null),
    [sub, S] = useState(null),
    [plans, PL] = useState([]),
    [publicDomain, PBD] = useState("localhost"),
    [supportContacts, SC] = useState({}),
    [selectedPlanId, SPI] = useState("one-year"),
    [step, T] = useState(0),
    [editingStep, ES] = useState(null),
    [skillInput, SI] = useState(""),
    [err, E] = useState(""),
    [msg, M] = useState(""),
    [usernameCheck, UC] = useState(null),
    [usernameSaved, US] = useState(false),
    [phone, H] = useState(false),
    [device, D] = useState("desktop");
  async function load() {
    try {
      const [a, b] = await Promise.all([
        api.get("/portfolio/me"),
        api.get("/portfolio/subscription"),
      ]);
      P(a.data.portfolio);
      US(Boolean(a.data.portfolio.username));
      T(a.data.portfolio.onboardingStep || 0);
      ES(null);
      S(b.data.subscription);
      PL(b.data.plans || []);
      PBD(b.data.publicBaseDomain || "localhost");
      SC(b.data.supportContacts || {});
      SPI(
        b.data.subscription?.planId ||
          b.data.plans?.find((availablePlan) => availablePlan.amount > 0)?.id ||
          "one-year",
      );
    } catch (e) {
      if (e.response?.status === 401) nav("/login");
      else E(e.response?.data?.message || "Could not load workspace.");
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function save(data, next) {
    try {
      const r = await api.patch("/portfolio/me", {
        ...data,
        ...(next
          ? { onboardingStep: Math.max(p.onboardingStep || 0, step + 1) }
          : {}),
      });
      P(r.data.portfolio);
      if (next) {
        T(Math.min(step + 1, 7));
        ES(null);
        if (step === 2) SI("");
      }
      M("Saved just now");
      return true;
    } catch (e) {
      E(e.response?.data?.message || "Could not save.");
      return false;
    }
  }
  function addSkill() {
    const skill = skillInput.trim();

    if (!skill) return;

    if (
      !(p.skills || []).some(
        (existing) => existing.toLowerCase() === skill.toLowerCase(),
      )
    ) {
      P({ ...p, skills: [...(p.skills || []), skill] });
    }

    SI("");
  }
  function setProfile(k, v) {
    P({ ...p, profile: { ...p.profile, [k]: v } });
  }
  async function username() {
    try {
      const r = await api.put("/portfolio/username", {
        username: p.username,
        onboardingStep: 5,
      });
      P(r.data.portfolio);
      US(true);
      UC(null);
      T(6);
    } catch (e) {
      E(e.response?.data?.message || "Username unavailable");
    }
  }
  async function pay(planId = selectedPlanId) {
    try {
      const r = await api.post("/billing/order", { planId });
      if (r.data.mode === "simulation") {
        const a = await api.post("/billing/simulate-success", {
          orderId: r.data.orderId,
        });
        S(a.data.subscription);
        if (a.data.portfolio) P(a.data.portfolio);
        M(
          a.data.published
            ? "Payment complete. Your personal brand website is live."
            : "Payment complete. Your website could not be published automatically.",
        );
        return;
      }
      if (!window.Razorpay) {
        await new Promise((ok, no) => {
          let x = document.createElement("script");
          x.src = "https://checkout.razorpay.com/v1/checkout.js";
          x.onload = ok;
          x.onerror = no;
          document.body.append(x);
        });
      }
      new window.Razorpay({
        key: r.data.keyId,
        amount: r.data.plan.amount * 100,
        currency: r.data.plan.currency,
        order_id: r.data.orderId,
        name: "Prakash SaaS",
        handler: async (payment) => {
          try {
            const a = await api.post("/billing/verify", payment);
            S(a.data.subscription);
            if (a.data.portfolio) P(a.data.portfolio);
            M(
              a.data.published
                ? "Payment complete. Your personal brand website is live."
                : "Payment complete. Your website could not be published automatically.",
            );
          } catch (e) {
            E(e.response?.data?.message || "Payment verification failed.");
          }
        },
      }).open();
    } catch (e) {
      E(e.response?.data?.message || "Unable to start checkout.");
    }
  }
  if (!p)
    return (
      <div className="loading">
        <Brand />
        <p>Opening your workspace…</p>
        {err}
      </div>
    );
  const pct =
    [
      p.profile.fullName,
      p.profile.contactNumber,
      p.username,
      p.templateId,
      p.projects?.length,
    ].filter(Boolean).length * 20;
  return (
    <div className="app-shell">
      <aside className={phone ? "open" : ""}>
        <Brand />
        <button className="drawer-close" onClick={() => H(false)}>
          Close navigation ×
        </button>
        <div className="side-title">
          <b>Personal Branding</b>
          <small>YOUR WORKSPACE</small>
        </div>
        <div className="side-links">
          {steps.map((s, i) => (
            <button
              className={i === step ? "selected" : ""}
              onClick={() => T(i)}
              key={s}
            >
              <span>{["⌂", "✎", "✳", "▧", "↗", "◎", "▦", "◉", "◇"][i]}</span>
              {s}
            </button>
          ))}
        </div>
        <button
          className="logout"
          onClick={async () => {
            await api.post("/auth/logout");
            nav("/");
          }}
        >
          ↗　 Log out
        </button>
      </aside>
      <main className="app-main">
        <header>
          <button
            className="mobile-toggle"
            aria-label="Toggle navigation"
            onClick={() => H(!phone)}
          >
            <Menu />
          </button>
          <span>
            Workspace / <b>{steps[step] || "Settings"}</b>
          </span>
          <div>
            {p.username && <Link to={"/p/" + p.username}>Preview ↗</Link>}
          </div>
        </header>
        <div className="work">
          {err && (
            <div className="alert">
              {err}
              <button onClick={() => E("")}>×</button>
            </div>
          )}
          {msg && (
            <div className="success">
              {msg}
              <button onClick={() => M("")}>×</button>
            </div>
          )}
          {step === 0 && (
            <>
              <small className="eyebrow">YOUR WORKSPACE</small>
              <h1>
                A little progress,{" "}
                <i>{p.profile.fullName?.split(" ")[0] || "today"}.</i>
              </h1>
              <p>
                Your space is taking shape. Add the pieces that feel like you.
              </p>
              <div className="dash-grid">
                <section className="panel">
                  <div className="panel-head">
                    <div>
                      <small className="eyebrow">YOUR PORTFOLIO</small>
                      <h2>
                        {p.status === "published"
                          ? "Out in the world"
                          : "Taking shape"}
                      </h2>
                    </div>
                    <span className="badge">{p.status}</span>
                  </div>
                  <div className="progress-row">
                    <strong>{pct}%</strong>
                    <div>
                      <b>Keep going, you’re doing great.</b>
                      <p>
                        Add the details that make your personal brand yours.
                      </p>
                      <button className="btn dark small" onClick={() => T(1)}>
                        Continue setup →
                      </button>
                    </div>
                  </div>
                  {[
                    [
                      "About you",
                      !!p.profile.fullName && !!p.profile.contactNumber,
                      1,
                    ],
                    ["Your address", !!p.username, 5],
                    ["Choose a look", !!p.templateId, 6],
                    ["Activate your plan", sub?.status === "active", 8],
                  ].map(([x, ok, n]) => (
                    <button className="task" key={x} onClick={() => T(n)}>
                      <i>{ok ? "✓" : "·"}</i>
                      {x}
                      <small>{ok ? "Done" : "Continue"}</small>
                    </button>
                  ))}
                </section>
                <section className="panel">
                  <small className="eyebrow">YOUR ADDRESS</small>
                  <h3>{p.username || "Your name, online."}</h3>
                  <p>
                    {p.username
                      ? `${p.username}.${publicDomain}`
                      : "Choose your address to get started."}
                  </p>
                  <button className="textbtn" onClick={() => T(5)}>
                    {usernameSaved ? "View saved address" : "Choose address"} ↗
                  </button>
                  <hr />
                  <small className="eyebrow">PORTFOLIO VIEWS</small>
                  <h2>—</h2>
                  <small>Analytics will show after publishing.</small>
                </section>
              </div>
              <section className="panel">
                <h3>Pick up where you left off</h3>
                {steps.slice(1, 8).map((x, i) => (
                  <button
                    className="task inline"
                    key={x}
                    onClick={() => T(i + 1)}
                  >
                    {x} <span>→</span>
                  </button>
                ))}
              </section>
            </>
          )}
          {[1, 2, 3, 4].includes(step) && (
            <>
              <button className="textbtn" onClick={() => T(step - 1)}>
                ← Back
              </button>
              <small className="eyebrow">
                STEP {step} OF 7 · SAVES AS YOU GO
              </small>
              <h1>
                {
                  [
                    "",
                    "Start with the essentials.",
                    "Add a little more of your story.",
                    "Show us what you’ve made.",
                    "Let people find you elsewhere.",
                  ][step]
                }
              </h1>
              <p>
                {step === 1
                  ? "Your name and contact number are all you need. Everything else can wait."
                  : "Everything here is optional. Add what feels useful."}
              </p>
              {step < (p.onboardingStep || 0) && editingStep !== step ? (
                <SavedStepSummary
                  step={step}
                  portfolio={p}
                  onEdit={() => ES(step)}
                  onNext={() => T(step + 1)}
                />
              ) : (
                <section className="panel form-panel">
                  {step === 1 && (
                    <div className="form-grid">
                      <label>
                        Full name <em>REQUIRED</em>
                        <input
                          value={p.profile.fullName || ""}
                          onChange={(e) =>
                            setProfile("fullName", e.target.value)
                          }
                          placeholder="e.g. Rahul Sharma"
                        />
                      </label>
                      <label>
                        Contact number <em>REQUIRED · PRIVATE</em>
                        <input
                          type="tel"
                          value={p.profile.contactNumber || ""}
                          onChange={(e) =>
                            setProfile("contactNumber", e.target.value)
                          }
                          placeholder="+91 98765 43210"
                        />
                        <small>
                          Private unless you switch on public display.
                        </small>
                      </label>
                      <label>
                        Professional title
                        <input
                          value={p.profile.title || ""}
                          onChange={(e) => setProfile("title", e.target.value)}
                          placeholder="Product designer"
                        />
                      </label>
                      <label>
                        Location
                        <input
                          value={p.profile.location || ""}
                          onChange={(e) =>
                            setProfile("location", e.target.value)
                          }
                          placeholder="City, country"
                        />
                      </label>
                      <label>
                        Public email
                        <input
                          type="email"
                          value={p.profile.email || ""}
                          onChange={(e) => setProfile("email", e.target.value)}
                          placeholder="hello@example.com"
                        />
                      </label>
                      <label>
                        Short introduction
                        <textarea
                          value={p.profile.intro || ""}
                          onChange={(e) => setProfile("intro", e.target.value)}
                        />
                      </label>
                      <label>
                        About you
                        <textarea
                          rows="5"
                          value={p.profile.bio || ""}
                          onChange={(e) => setProfile("bio", e.target.value)}
                        />
                      </label>
                      <label className="check-label">
                        <input
                          type="checkbox"
                          checked={!!p.profile.showContact}
                          onChange={(e) =>
                            setProfile("showContact", e.target.checked)
                          }
                        />{" "}
                        Display my contact number publicly
                      </label>
                    </div>
                  )}
                  {step === 2 && (
                    <>
                      <div className="skill-picker">
                        <label htmlFor="skill-entry">Skills</label>
                        <div className="skill-tags">
                          {(p.skills || []).map((skill) => (
                            <span className="skill-tag" key={skill}>
                              {skill}
                              <button
                                type="button"
                                aria-label={`Remove ${skill}`}
                                onClick={() =>
                                  P({
                                    ...p,
                                    skills: p.skills.filter(
                                      (item) => item !== skill,
                                    ),
                                  })
                                }
                              >
                                ×
                              </button>
                            </span>
                          ))}
                          <input
                            id="skill-entry"
                            value={skillInput}
                            onChange={(e) => SI(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addSkill();
                              }
                            }}
                            placeholder={
                              p.skills?.length
                                ? "Type another skill and press Enter"
                                : "e.g. Product Design, then press Enter"
                            }
                          />
                          <button
                            className="skill-add-btn"
                            type="button"
                            onClick={addSkill}
                            disabled={!skillInput.trim()}
                          >
                            Add skill
                          </button>
                        </div>
                        <small>
                          Spaces are fine. Press Enter after each skill.
                        </small>
                      </div>
                      {["education", "experience", "certifications"].map(
                        (g) => (
                          <Entry
                            key={g}
                            name={g}
                            list={p[g] || []}
                            change={(x) => P({ ...p, [g]: x })}
                          />
                        ),
                      )}
                    </>
                  )}
                  {step === 3 && (
                    <Entry
                      name="Projects"
                      list={p.projects || []}
                      change={(x) => P({ ...p, projects: x })}
                      project
                    />
                  )}
                  {step === 4 && (
                    <div className="form-grid">
                      {[
                        "GitHub",
                        "LinkedIn",
                        "Instagram",
                        "X",
                        "YouTube",
                        "Website",
                      ].map((x) => (
                        <label key={x}>
                          {x} URL
                          <input
                            value={p.socials?.[x] || ""}
                            onChange={(e) =>
                              P({
                                ...p,
                                socials: { ...p.socials, [x]: e.target.value },
                              })
                            }
                            placeholder="https://"
                          />
                        </label>
                      ))}
                    </div>
                  )}
                  <div className="actions">
                    <button
                      className="btn dark"
                      disabled={
                        step === 1 &&
                        (!p.profile.fullName?.trim() ||
                          !p.profile.contactNumber?.trim())
                      }
                      onClick={async () => {
                        const editing = editingStep === step;
                        const data =
                          step === 1
                            ? { profile: p.profile }
                            : step === 2
                              ? {
                                  skills: skillInput.trim()
                                    ? Array.from(
                                        new Map(
                                          [
                                            ...(p.skills || []),
                                            skillInput.trim(),
                                          ].map((skill) => [
                                            skill.toLowerCase(),
                                            skill,
                                          ]),
                                        ).values(),
                                      )
                                    : p.skills,
                                  education: p.education,
                                  experience: p.experience,
                                  certifications: p.certifications,
                                }
                              : step === 3
                                ? { projects: p.projects }
                                : { socials: p.socials };
                        const saved = await save(data, !editing);

                        if (saved && editing) {
                          ES(null);
                          SI("");
                        }
                      }}
                    >
                      {editingStep === step
                        ? "Save changes"
                        : "Save & continue →"}
                    </button>
                    {step > 1 && editingStep !== step && (
                      <button
                        className="textbtn"
                        onClick={() => {
                          save({ onboardingStep: step + 1 }, false);
                          T(step + 1);
                        }}
                      >
                        Skip for now
                      </button>
                    )}
                  </div>
                </section>
              )}
            </>
          )}
          {step === 5 && (
            <>
              <button className="textbtn" onClick={() => T(4)}>
                ← Back
              </button>
              <small className="eyebrow">YOUR PERSONAL ADDRESS</small>
              <h1>
                Choose your profile URL <i>once.</i>
              </h1>
              <p className="address-intro">
                Pick the link you want people to use for your online profile.
                You can select it only once, so check the spelling before you
                save.
              </p>
              <section className="panel">
                <label>
                  Your profile address
                  <div className="username-preview">
                    <span>https://</span>
                    <input
                      value={p.username || ""}
                      disabled={usernameSaved}
                      aria-label="Choose your profile address"
                      onChange={(e) => {
                        UC(null);
                        P({
                          ...p,
                          username: e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, ""),
                        });
                      }}
                    />
                    <span className="address-domain">.{publicDomain}</span>
                  </div>
                  {!usernameSaved && (
                    <small className="address-hint">
                      3–30 characters. Use lowercase letters, numbers, or
                      hyphens.
                    </small>
                  )}
                </label>
                <div className="address-live-preview">
                  <div className="address-preview-icon">
                    <Globe size={18} />
                  </div>
                  <div>
                    <small>YOUR PROFILE WILL BE AT</small>
                    <strong>
                      {p.username || "yourname"}.{publicDomain}
                    </strong>
                  </div>
                </div>
                {!usernameSaved && (
                  <>
                    <button
                      className="btn address-check-btn"
                      disabled={!p.username || p.username.length < 3}
                      onClick={async () => {
                        try {
                          const r = await api.get(
                            "/portfolio/username/" + p.username,
                          );
                          UC(r.data);
                        } catch (e) {
                          UC({
                            available: false,
                            message:
                              e.response?.data?.message ||
                              "Could not check this address. Please try again.",
                          });
                        }
                      }}
                    >
                      Check availability
                    </button>
                    {usernameCheck && (
                      <p
                        className={`address-check-result ${usernameCheck.available ? "available" : "unavailable"}`}
                        role="status"
                      >
                        {usernameCheck.message}
                      </p>
                    )}
                    <div className="address-once-note">
                      <strong>
                        Choose carefully — this is a one-time choice.
                      </strong>
                      <span>
                        Once saved, your profile address cannot be changed.
                      </span>
                    </div>
                    <button
                      className="btn dark"
                      disabled={!usernameCheck?.available}
                      onClick={username}
                    >
                      Save this profile address →
                    </button>
                  </>
                )}
                {usernameSaved && (
                  <div className="address-locked-actions">
                    <div className="address-locked-note">
                      <strong>Your profile address is set</strong>
                      <span>This one-time choice is now locked.</span>
                    </div>
                    <button className="btn dark" onClick={() => T(6)}>
                      Next: choose your look →
                    </button>
                  </div>
                )}
              </section>
            </>
          )}
          {step === 6 && (
            <>
              <button className="textbtn" onClick={() => T(5)}>
                ← Back
              </button>
              <small className="eyebrow">CHOOSE YOUR LOOK</small>
              <h1>
                A look that feels like <i>you.</i>
              </h1>
              <div className="template-grid">
                {templates.map((t, i) => (
                  <button
                    key={t.id}
                    onClick={async () => {
                      let r = await api.put("/portfolio/template", {
                        templateId: t.id,
                      });
                      P(r.data.portfolio);
                    }}
                    className={
                      "template-tile " +
                      t.id +
                      (p.templateId === t.id ? " chosen" : "")
                    }
                  >
                    <div className="tile-preview">
                      <small>0{i + 1} / TEMPLATE</small>
                      <h3>{t.name}</h3>
                      <span>{t.copy}</span>
                    </div>
                    <b>
                      {p.templateId === t.id
                        ? "✓ Selected"
                        : "Choose this look →"}
                    </b>
                  </button>
                ))}
              </div>
              <p className="template-coming-soon">
                More templates coming soon.
              </p>
              <button
                className="btn dark"
                onClick={async () => {
                  await save(
                    { templateId: p.templateId, onboardingStep: 6 },
                    false,
                  );
                  T(7);
                }}
              >
                Preview your personal brand →
              </button>
            </>
          )}
          {step === 7 && (
            <>
              <button className="textbtn" onClick={() => T(6)}>
                ← Change template
              </button>
              <small className="eyebrow">YOUR FIRST LOOK</small>
              <h1>
                There you <i>are.</i>
              </h1>
              <div className="device-controls">
                {[
                  { id: "desktop", label: "Desktop", Icon: Monitor },
                  { id: "tablet", label: "Tablet", Icon: Tablet },
                  { id: "mobile", label: "Mobile", Icon: Smartphone },
                ].map(({ id, label, Icon }) => (
                  <button
                    className={device === id ? "active" : ""}
                    onClick={() => D(id)}
                    aria-label={`Preview on ${label.toLowerCase()}`}
                    aria-pressed={device === id}
                    key={id}
                  >
                    <Icon size={15} aria-hidden="true" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
              <div className={"preview-wrap " + device}>
                <PortfolioView portfolio={p} preview />
              </div>
              <button className="textbtn" onClick={() => T(1)}>
                Edit information
              </button>{" "}
              <button className="btn dark" onClick={() => T(8)}>
                Continue to publishing →
              </button>
            </>
          )}
          {step === 8 && (
            <>
              <button className="textbtn" onClick={() => T(7)}>
                ← Back to preview
              </button>
              <small className="eyebrow">READY WHEN YOU ARE</small>
              <h1>
                Your next chapter is <i>yours.</i>
              </h1>
              <div className="dash-grid">
                <section className="panel subscription-plan-panel">
                  <small className="eyebrow">CHOOSE YOUR SUBSCRIPTION</small>
                  {sub?.status === "active" ? (
                    <div className="subscription-active-summary">
                      <h2>Your plan is active.</h2>
                      <p>
                        {sub.planName || "Subscription"} access through{" "}
                        {sub.endsAt
                          ? new Date(sub.endsAt).toLocaleDateString()
                          : "your plan end date"}
                        .
                      </p>
                      {p.status === "published" && (
                        <>
                          <p className="published-status">
                            Your personal brand website is live.
                          </p>
                          <SupportContacts contacts={supportContacts} />
                        </>
                      )}
                    </div>
                  ) : (
                    <>
                      <h2>Pick the access period that works for you.</h2>
                      <PricingPlans
                        plans={plans}
                        selectedPlanId={selectedPlanId}
                        onSelect={SPI}
                      />
                      <button
                        className="btn dark"
                        disabled={
                          !plans.some(
                            (planOption) =>
                              planOption.id === selectedPlanId &&
                              planOption.amount > 0,
                          )
                        }
                        onClick={() => pay(selectedPlanId)}
                      >
                        Activate{" "}
                        {plans.find(
                          (planOption) => planOption.id === selectedPlanId,
                        )?.name || "selected plan"}{" "}
                        →
                      </button>
                      <small className="payment-note">
                        Local simulation is clearly labeled and disabled by
                        default.
                      </small>
                    </>
                  )}
                </section>
                <section className="panel">
                  <small className="eyebrow">PUBLISH CHECKLIST</small>
                  {[
                    [
                      p.profile.fullName && p.profile.contactNumber,
                      "Profile essentials",
                    ],
                    [p.username, "Personal address"],
                    [p.templateId, "Personal brand design"],
                    [sub?.status === "active", "Active subscription"],
                  ].map(([ok, label]) => (
                    <p key={label}>
                      {ok ? "✓" : "·"}　{label}
                    </p>
                  ))}
                  {p.status === "published" && (
                    <p className="published-status">
                      Your website was published automatically after payment.
                    </p>
                  )}
                </section>
              </div>
            </>
          )}{" "}
          {step === 9 && <AnalyticsPanel />}
          {step === 10 && (
            <>
              <small className="eyebrow">YOUR PLAN</small>
              <h1>
                {sub?.status === "active" ? (
                  <>
                    Your <i>active plan.</i>
                  </>
                ) : (
                  <>
                    Choose your <i>access period.</i>
                  </>
                )}
              </h1>
              <section className="panel">
                <p>
                  {sub?.status
                    ? `Current plan: ${sub.planName || sub.planId || "Subscription"} · ${sub.status}`
                    : "No active subscription yet."}
                </p>
                {sub?.endsAt && (
                  <p>
                    Valid through {new Date(sub.endsAt).toLocaleDateString()}
                  </p>
                )}
                {sub?.status === "active" ? (
                  p.status === "published" && (
                    <SupportContacts contacts={supportContacts} />
                  )
                ) : (
                  <>
                    <PricingPlans
                      plans={plans}
                      selectedPlanId={selectedPlanId}
                      onSelect={SPI}
                    />
                    <button
                      className="btn dark"
                      disabled={
                        !plans.some(
                          (planOption) =>
                            planOption.id === selectedPlanId &&
                            planOption.amount > 0,
                        )
                      }
                      onClick={() => pay(selectedPlanId)}
                    >
                      Activate{" "}
                      {plans.find(
                        (planOption) => planOption.id === selectedPlanId,
                      )?.name || "selected plan"}{" "}
                      →
                    </button>
                  </>
                )}
              </section>
            </>
          )}{" "}
          {step === 11 && <BillingHistory />}
          {step === 12 && (
            <>
              <small className="eyebrow">PRIVACY & DISPLAY</small>
              <h1>
                Your details, <i>your call.</i>
              </h1>
              <section className="panel">
                <label className="check-label">
                  <input
                    type="checkbox"
                    checked={!!p.profile.showContact}
                    onChange={(e) =>
                      P({
                        ...p,
                        profile: {
                          ...p.profile,
                          showContact: e.target.checked,
                        },
                      })
                    }
                  />{" "}
                  Show my contact number on my public page
                </label>
                <p>Your number stays private unless you turn this on.</p>
                <button
                  className="btn dark"
                  onClick={() => save({ profile: p.profile }, false)}
                >
                  Save privacy setting →
                </button>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
function Public() {
  const { username: u } = useParams(),
    [p, P] = useState(null),
    [err, E] = useState("");
  useEffect(() => {
    const host = location.hostname;
    const n =
      u ||
      (host.endsWith(".localhost")
        ? host.replace(".localhost", "").split(".")[0]
        : host.split(".").length > 2
          ? host.split(".")[0]
          : null);
    api
      .get("/public/" + n)
      .then((r) => {
        const v = r.data.portfolio;
        P(v);
        const title =
          (v.profile?.fullName || "Personal brand") +
          (v.profile?.title ? " — " + v.profile.title : "");
        document.title = title;
        let d = document.querySelector("meta[name=description]");
        if (!d) {
          d = document.createElement("meta");
          d.name = "description";
          document.head.append(d);
        }
        d.content = (
          v.profile?.intro ||
          v.profile?.bio ||
          "Personal brand"
        ).slice(0, 160);
        let c = document.querySelector("link[rel=canonical]");
        if (!c) {
          c = document.createElement("link");
          c.rel = "canonical";
          document.head.append(c);
        }
        c.href = r.data.canonical || location.href;
        let robots = document.querySelector("meta[name=robots]");
        if (!robots) {
          robots = document.createElement("meta");
          robots.name = "robots";
          document.head.append(robots);
        }
        robots.content = "index,follow";
      })
      .catch(() => {
        E("This personal brand page is not available right now.");
        document.title = "Personal brand page unavailable";
        let m = document.querySelector("meta[name=robots]");
        if (m) m.content = "noindex,nofollow";
      });
  }, [u]);
  return p ? (
    <PortfolioView portfolio={p} />
  ) : (
    <div className="not-found">
      <Brand />
      <h1>{err || "Opening your personal brand…"}</h1>
      <Link to="/">Back to Personal Branding</Link>
    </div>
  );
}
export default function App() {
  const host = location.hostname.toLowerCase(),
    label = host.split(".")[0],
    reserved = [
      "personal",
      "www",
      "api",
      "admin",
      "clinic",
      "venues",
      "coaching",
      "salon",
      "support",
      "help",
      "dashboard",
      "login",
      "register",
      "static",
      "assets",
      "mail",
      "smtp",
      "ftp",
      "blog",
    ];
  if (
    (host.endsWith(".localhost") && !reserved.includes(label)) ||
    (host !== "localhost" &&
      host.split(".").length > 2 &&
      !reserved.includes(label))
  )
    return <Public />;
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<PasswordSetupPage />} />
      <Route path="/app/*" element={<Workspace />} />
      <Route path="/p/:username" element={<Public />} />
      <Route path="*" element={<Landing />} />
    </Routes>
  );
}
