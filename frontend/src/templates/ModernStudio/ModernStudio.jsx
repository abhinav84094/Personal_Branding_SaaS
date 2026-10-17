import React from "react";
import { ArrowUpRight, ArrowDown, MapPin } from "lucide-react";
import { safeUrl, PreviewRibbon } from "../PortfolioSections.jsx";
import { audienceFields, fieldLabels } from "../../audience.js";
import "./modern-studio.css";

const initialLetters = (name) =>
  (name || "Your name")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
const meaningful = (entries = []) =>
  entries.filter(
    (entry) => entry.title || entry.institution || entry.description,
  );

function Journey({ title, entries = [] }) {
  const items = meaningful(entries);
  if (!items.length) return null;
  return (
    <section className="ms-journey">
      <h3>{title}</h3>
      <div>
        {items.map((item, index) => (
          <article key={item._id || index}>
            <span className="ms-timeline-dot" aria-hidden="true" />
            {(item.startDate || item.endDate) && (
              <small>
                {[item.startDate, item.endDate].filter(Boolean).join(" — ")}
              </small>
            )}
            {item.title && <h4>{item.title}</h4>}
            {item.institution && (
              <span className="ms-institution">{item.institution}</span>
            )}
            {item.description && <p>{item.description}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}

export function ModernStudioPreview() {
  return (
    <div
      className="tile-preview ms-mini"
      aria-label="Modern Studio: editorial layout with orange accents"
    >
      <div className="ms-mini-nav">
        <span>MODERN STUDIO</span>
        <span>PORTFOLIO ↗</span>
      </div>
      <div className="ms-mini-body">
        <div>
          <small>A LITTLE DIFFERENT.</small>
          <h3>
            Good work.
            <br />
            <em>Great presence.</em>
          </h3>
          <span className="ms-mini-cta">Explore my work ↗</span>
        </div>
        <div className="ms-mini-art" aria-hidden="true">
          <span>m.</span>
        </div>
      </div>
      <div className="ms-mini-bottom">
        <span>A fresh perspective.</span>
        <span>01 / SELECTED WORK</span>
      </div>
    </div>
  );
}

export default function ModernStudio({
  portfolio = {},
  preview = false,
  variant = "",
}) {
  const [motionPaused, setMotionPaused] = React.useState(false);
  const profile = portfolio.profile || {};
  const student = profile.category === "student";
  const name = profile.fullName || "Your name";
  const profession =
    profile.profession === "Other"
      ? profile.customProfession
      : profile.profession;
  const projects = meaningful(portfolio.projects);
  const skills = portfolio.skills || [];
  const details = audienceFields(profile).filter((key) => profile[key]);
  const socials = Object.entries(portfolio.socials || {}).filter(([, url]) =>
    safeUrl(url),
  );
  const hasJourney = [
    portfolio.education,
    portfolio.experience,
    portfolio.certifications,
    portfolio.achievements,
  ].some((items) => meaningful(items).length);
  const hasAbout = Boolean(
    profile.bio || skills.length || details.length || hasJourney,
  );
  const contact = profile.email
    ? `mailto:${profile.email}`
    : profile.showContact && profile.contactNumber
      ? `tel:${profile.contactNumber}`
      : "";
  const photo = safeUrl(profile.profileImage);
  return (
    <main
      className={
        "modern-site" +
        (variant ? " ms-" + variant : "") +
        (motionPaused ? " ms-motion-paused" : "")
      }
    >
      <a className="ms-skip" href="#ms-main">
        Skip to content
      </a>
      <div className="ms-frame">
        {variant && (
          <div className="ms-motion-control">
            <button
              type="button"
              aria-pressed={motionPaused}
              onClick={() => setMotionPaused(!motionPaused)}
            >
              {motionPaused ? "Resume animations" : "Pause animations"}
            </button>
          </div>
        )}
        <nav className="ms-nav" aria-label="Portfolio navigation">
          <a className="ms-brand" href="#ms-main">
            <span className="ms-brand-symbol" aria-hidden="true">
              ✳
            </span>
            {name}
            <span className="ms-brand-dot">.</span>
          </a>
          <div>
            {projects.length > 0 && <a href="#ms-work">Work</a>}
            {hasAbout && <a href="#ms-about">About</a>}
            {contact && (
              <a className="ms-nav-contact" href="#ms-contact">
                Let’s talk <ArrowUpRight size={16} />
              </a>
            )}
          </div>
        </nav>
        <header className="ms-hero" id="ms-main">
          <div className="ms-hero-copy">
            <span className="ms-eyebrow">
              <span className="ms-status-dot" />
              {profile.availability ||
                (student
                  ? "STUDENT · ALWAYS EXPLORING"
                  : profession || "A PERSONAL PERSPECTIVE")}
            </span>
            <p className="ms-introduce">Hello, I’m {name}.</p>
            <h1>
              {profile.title ||
                (student
                  ? "Learning today. Building tomorrow."
                  : "A fresh perspective. Meaningful work.")}
            </h1>
            {profile.intro && <p className="ms-intro">{profile.intro}</p>}
            <div className="ms-hero-actions">
              {projects.length > 0 ? (
                <a className="ms-button" href="#ms-work">
                  Explore my work <ArrowDown size={18} />
                </a>
              ) : contact ? (
                <a className="ms-button" href={contact}>
                  Get in touch <ArrowUpRight size={18} />
                </a>
              ) : hasAbout ? (
                <a className="ms-button" href="#ms-about">
                  Get to know me <ArrowDown size={18} />
                </a>
              ) : null}
              {contact && projects.length > 0 && (
                <a className="ms-text-link" href={contact}>
                  Let’s connect <ArrowUpRight size={16} />
                </a>
              )}
            </div>
            {profile.location && (
              <span className="ms-location">
                <MapPin size={14} />
                {profile.location}
              </span>
            )}
          </div>
          <div className="ms-identity">
            <div className={"ms-identity-art" + (photo ? " has-photo" : "")}>
              {photo ? (
                <img
                  src={photo}
                  alt={name}
                  onError={(e) => {
                    e.currentTarget.hidden = true;
                    e.currentTarget.parentElement.classList.remove("has-photo");
                  }}
                />
              ) : null}
              <span className="ms-initials" aria-hidden="true">
                {initialLetters(name)}
                <i>.</i>
              </span>
              <span className="ms-art-orbit" aria-hidden="true" />
              <span className="ms-art-label">
                A WORK IN PROGRESS.
                <br />A STORY WORTH SHARING.
              </span>
              <span className="ms-art-star" aria-hidden="true">
                ✳
              </span>
            </div>
            <div className="ms-identity-caption">
              <div>
                <strong>{name}</strong>
                <span>
                  {student
                    ? profile.course || "Student"
                    : profession || profile.title || "Personal portfolio"}
                </span>
              </div>
              <ArrowUpRight size={25} aria-hidden="true" />
            </div>
          </div>
        </header>
        {skills.length > 0 && (
          <div className="ms-skill-strip" aria-label="Featured skills">
            {skills.slice(0, 6).map((skill, index) => (
              <React.Fragment key={skill + index}>
                <span>{skill}</span>
                {index < Math.min(skills.length, 6) - 1 && (
                  <span className="ms-strip-star" aria-hidden="true">
                    ✳
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
        {projects.length > 0 && (
          <section className="ms-section" id="ms-work">
            <div className="ms-section-heading">
              <div>
                <span className="ms-eyebrow">01 / SELECTED WORK</span>
                <h2>
                  Ideas, brought
                  <br />
                  to <em>life.</em>
                </h2>
              </div>
              <p>
                {student
                  ? "A collection of things I’m learning, exploring, and building."
                  : "A closer look at my work and the thinking behind it."}
              </p>
            </div>
            <div className="ms-project-grid">
              {projects.map((project, index) => {
                const live = safeUrl(project.liveUrl),
                  github = safeUrl(project.githubUrl),
                  image = safeUrl(project.imageUrl);
                return (
                  <article
                    className={"ms-project ms-project-" + (index % 4)}
                    key={project._id || index}
                  >
                    <div className="ms-project-art">
                      {image && (
                        <img
                          src={image}
                          alt={project.title || "Project preview"}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.hidden = true;
                          }}
                        />
                      )}
                      <div
                        className="ms-project-placeholder"
                        aria-hidden="true"
                      >
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <strong>
                          {project.title || "Selected work"}
                          <i>↗</i>
                        </strong>
                        <div className="ms-project-shape" />
                      </div>
                    </div>
                    <div className="ms-project-info">
                      <div>
                        <small>
                          {(project.technologies || []).join(" / ") ||
                            "SELECTED WORK"}
                        </small>
                        <h3>{project.title || "Selected work"}</h3>
                      </div>
                      {live && (
                        <a
                          className="ms-project-go"
                          href={live}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={"View " + (project.title || "project")}
                        >
                          <ArrowUpRight size={22} />
                        </a>
                      )}
                    </div>
                    {project.description && <p>{project.description}</p>}
                    {github && (
                      <a
                        className="ms-text-link"
                        href={github}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View source <ArrowUpRight size={15} />
                      </a>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        )}
        {hasAbout && (
          <section className="ms-section" id="ms-about">
            <div className="ms-about-grid">
              <div>
                <span className="ms-eyebrow">
                  {projects.length ? "02" : "01"} / BEHIND THE WORK
                </span>
                <h2>
                  A little about
                  <br />
                  <em>me.</em>
                </h2>
                {profile.bio && <p className="ms-bio">{profile.bio}</p>}
                {socials.length > 0 && (
                  <div className="ms-socials">
                    {socials.map(([network, url]) => (
                      <a
                        key={network}
                        href={safeUrl(url)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {network}
                        <ArrowUpRight size={15} />
                      </a>
                    ))}
                  </div>
                )}
              </div>
              <div className="ms-about-content">
                {details.length > 0 && (
                  <dl className="ms-details">
                    {details.map((key) => (
                      <div key={key}>
                        <dt>{fieldLabels[key]}</dt>
                        <dd>{profile[key]}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {skills.length > 0 && (
                  <div className="ms-skills">
                    <h3>My toolkit</h3>
                    <div>
                      {skills.map((skill, index) => (
                        <span key={skill + index}>{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
                <Journey
                  title={student ? "Education" : "Experience"}
                  entries={student ? portfolio.education : portfolio.experience}
                />
                <Journey
                  title={student ? "Internships & experience" : "Education"}
                  entries={student ? portfolio.experience : portfolio.education}
                />
                <Journey
                  title="Certifications"
                  entries={portfolio.certifications}
                />
                <Journey
                  title="Achievements"
                  entries={portfolio.achievements}
                />
              </div>
            </div>
          </section>
        )}
        {contact && (
          <section className="ms-contact" id="ms-contact">
            <span className="ms-eyebrow">HAVE SOMETHING IN MIND?</span>
            <div>
              <h2>
                Let’s make
                <br />
                <em>something great.</em>
              </h2>
              <a
                href={contact}
                className="ms-contact-arrow"
                aria-label={"Contact " + name}
              >
                <ArrowUpRight size={44} />
              </a>
            </div>
            <a className="ms-contact-detail" href={contact}>
              {profile.email || profile.contactNumber}
            </a>
            {profile.email && profile.showContact && profile.contactNumber && (
              <a
                className="ms-contact-detail"
                href={"tel:" + profile.contactNumber}
              >
                {profile.contactNumber}
              </a>
            )}
          </section>
        )}
        <footer className="ms-footer">
          <span>
            © {new Date().getFullYear()} {name}
          </span>
          <div>
            {!hasAbout &&
              socials.map(([network, url]) => (
                <a
                  key={network}
                  href={safeUrl(url)}
                  target="_blank"
                  rel="noreferrer"
                >
                  {network} ↗
                </a>
              ))}
            <a href="#ms-main">Back to top ↑</a>
          </div>
        </footer>
      </div>
      {preview && <PreviewRibbon />}
    </main>
  );
}
