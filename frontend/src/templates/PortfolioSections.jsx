import React from "react";

export function safeUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

export function PortfolioNavigation({ name, socials = {} }) {
  const links = Object.entries(socials).filter(([, url]) => safeUrl(url));

  return (
    <nav>
      <b>
        {name || "Your name"}
        <small></small>
      </b>
      <div>
        {links.map(([network, url]) => (
          <a key={network} href={safeUrl(url)} target="_blank" rel="noreferrer">
            {network} ↗
          </a>
        ))}
      </div>
    </nav>
  );
}

export function PortfolioHero({ profile = {} }) {
  return (
    <header>
      <small>{profile.location || "INDEPENDENT PROFESSIONAL"}</small>
      <h1>
        {profile.fullName || "Your name"}
        <br />
        <i>{profile.title || "Your next chapter starts here."}</i>
      </h1>
      {profile.intro && <p>{profile.intro}</p>}
      {profile.email && (
        <a className="pbutton" href={`mailto:${profile.email}`}>
          Get in touch ↗
        </a>
      )}
      {profile.showContact && profile.contactNumber && (
        <a href={`tel:${profile.contactNumber}`}>{profile.contactNumber}</a>
      )}
    </header>
  );
}

export function AboutSection({ bio }) {
  if (!bio) return null;

  return (
    <section>
      <small>A LITTLE ABOUT ME</small>
      <h2>Building with intention.</h2>
      <p>{bio}</p>
    </section>
  );
}

export function SkillsSection({ skills = [] }) {
  if (!skills.length) return null;

  return (
    <section>
      <small>WHAT I WORK WITH</small>
      <h2>Skills &amp; tools</h2>
      <div className="chips">
        {skills.map((skill) => (
          <span key={skill}>{skill}</span>
        ))}
      </div>
    </section>
  );
}

export function ProjectsSection({ projects = [] }) {
  const featuredProjects = projects.filter((project) => project.title);

  if (!featuredProjects.length) return null;

  return (
    <section>
      <small>SELECTED WORK</small>
      <h2>A few things I’ve made.</h2>
      <div className="projects">
        {featuredProjects.map((project, index) => {
          const liveUrl = safeUrl(project.liveUrl);
          const githubUrl = safeUrl(project.githubUrl);

          return (
            <article key={project._id || `${project.title}-${index}`}>
              <small>{(project.technologies || []).join(" · ")}</small>
              <h3>{project.title}</h3>
              {project.description && <p>{project.description}</p>}
              {liveUrl && (
                <a href={liveUrl} target="_blank" rel="noreferrer">
                  View project ↗
                </a>
              )}
              {githubUrl && (
                <a href={githubUrl} target="_blank" rel="noreferrer">
                  Source ↗
                </a>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function CareerSection({ title, entries = [] }) {
  if (!entries.length) return null;

  return (
    <section>
      <small>{title.toUpperCase()}</small>
      {entries.map((entry, index) => (
        <p key={entry._id || `${title}-${index}`}>
          {entry.title && <b>{entry.title}</b>}
          {entry.institution && ` — ${entry.institution}`}
          {entry.description && ` ${entry.description}`}
        </p>
      ))}
    </section>
  );
}

export function PortfolioFooter({ profile = {} }) {
  return (
    <footer>
      <small>
        © {new Date().getFullYear()} {profile.fullName || "Your name"}
        {profile.location && ` · ${profile.location}`}
      </small>
    </footer>
  );
}

export function PreviewRibbon() {
  return <div className="preview-ribbon">PREVIEW · Only you can see this</div>;
}
