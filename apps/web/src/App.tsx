import './App.css'

const resources = [
  {
    title: 'Full-stack essentials',
    description:
      'A primer on what full-stack development entails and why cohesive practices across the stack matter.',
    url: 'https://www.w3schools.com/whatis/whatis_fullstack.asp',
  },
  {
    title: 'Front-End Checklist',
    description:
      'A production-ready checklist covering semantics, accessibility, performance, and security.',
    url: 'https://github.com/thedaviddias/Front-End-Checklist',
  },
  {
    title: 'Front-End Design Checklist',
    description:
      'Patterns for spacing, typography, layout, and interaction that keep UI decisions consistent.',
    url: 'https://github.com/thedaviddias/Front-End-Design-Checklist',
  },
  {
    title: 'Front-End Performance Checklist',
    description:
      'Practical levers for ship-time and runtime performance to keep the UX fast.',
    url: 'https://github.com/thedaviddias/Front-End-Performance-Checklist',
  },
  {
    title: 'Indie Dev Toolkit',
    description:
      'A curated toolbelt for solo and small-team builders (hosting, design, automation, analytics).',
    url: 'https://github.com/thedaviddias/indie-dev-toolkit',
  },
  {
    title: 'UX Patterns',
    description:
      'Human-centered patterns to guide flows, microcopy, and component behavior.',
    url: 'https://uxpatterns.dev/',
  },
]

const foundations = [
  {
    title: 'Architecture',
    items: [
      'Monorepo with web (Vite + React + TypeScript) and API (Express + TypeScript).',
      'Shared scripts for dev, lint, and tests across workspaces.',
      'Environment variables sourced via dotenv and documented in .env.example.',
    ],
  },
  {
    title: 'Quality gates',
    items: [
      'Vitest coverage-ready suites for both API and web.',
      'TypeScript strict mode enabled; linting wired via ESLint (web) and type-checks (API).',
      'Security middleware defaults on the API (helmet, CORS) and schema validation with Zod.',
    ],
  },
  {
    title: 'DX & ops',
    items: [
      'npm workspaces with top-level scripts to orchestrate tasks.',
      'Readable defaults in README with setup, dev, and deployment notes.',
      'Design system starter styles with responsive layout and accessible semantics.',
    ],
  },
]

const nextSteps = [
  'Deploy the API behind HTTPS and wire a reverse proxy (e.g., Nginx) to unify origins.',
  'Add CI for lint, test, and type checks using GitHub Actions (matrix for web/api).',
  'Instrument monitoring: basic uptime pings on /health and frontend web vitals (e.g., with Web Vitals API).',
  'Introduce feature flags for experimental UI/UX work and performance experiments.',
  'Harden authentication and authorization once user-facing endpoints exist (JWT or session-based).',
]

function App() {
  return (
    <div className="page">
      <header className="hero">
        <p className="eyebrow">friendly-adventure</p>
        <h1>Full-stack starter focused on quality and UX craft</h1>
        <p className="lede">
          A ready-to-extend workspace that pairs an Express API with a Vite +
          React front-end. Built with strict TypeScript, security middleware,
          and checklists that keep you shipping fast without sacrificing polish.
        </p>
        <div className="cta-row">
          <a className="button primary" href="https://github.com/thedaviddias/Front-End-Checklist" target="_blank" rel="noreferrer">
            Open the Front-End Checklist
          </a>
          <a className="button ghost" href="https://github.com/thedaviddias/indie-dev-toolkit" target="_blank" rel="noreferrer">
            Explore indie dev toolkit
          </a>
        </div>
      </header>

      <main>
        <section className="panel">
          <div className="panel-header">
            <h2>What&apos;s already wired in</h2>
            <p>Opinionated defaults you can keep or extend as the product grows.</p>
          </div>
          <div className="foundation-grid">
            {foundations.map((block) => (
              <article key={block.title} className="card">
                <h3>{block.title}</h3>
                <ul>
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Resource trail</h2>
            <p>Stay aligned with proven patterns for accessibility, performance, and UX.</p>
          </div>
          <div className="resource-grid">
            {resources.map((resource) => (
              <article key={resource.title} className="card resource-card">
                <div>
                  <h3>{resource.title}</h3>
                  <p>{resource.description}</p>
                </div>
                <a className="link" href={resource.url} target="_blank" rel="noreferrer">
                  Visit resource
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Next to learn & build</h2>
            <p>High-leverage follow-ups that keep the stack healthy and user-centric.</p>
          </div>
          <ol className="next-steps">
            {nextSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>
      </main>
    </div>
  )
}

export default App
