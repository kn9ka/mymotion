import { Card } from '@/shared/ui/Card';

const timeline = [
  {
    period: '2024 - now',
    role: 'Senior Frontend Engineer',
    company: 'Holland & Barrett',
    points: [
      'FSD rollout (RFC, templates, lint, CI) → defects ↓ ~70%.',
      'Next.js → Remix / React Router rewrite for SSR builder.',
      'SSR & hydration fixes; unified server/client rendering.',
      'Centralized data layer (TanStack/GraphQL) aligned to FSD.',
      'Codegen tooling → boilerplate ↓ ~80–90%, PR lead time ↓ ~35%.',
      'Multi-repo delivery (5+ apps); standardized CI/release cadence.',
    ],
  },
  {
    period: '2023 - 2024',
    role: 'Frontend Developer',
    company: 'Impress',
    points: [
      'Priority booking → wait time ↓ 10%, no-shows ↓ 30%.',
      'Custom multi-view scheduler (week/day/month).',
      'RBAC (permit.io) + audit scopes; safer access model.',
      'i18n at scale (Lokalise) → localization lead time ↓ 50%.',
      'Cross-stack delivery (FE + NestJS/Go); stronger typing.',
    ],
  },
  {
    period: '2019 - 2023',
    role: 'Senior Web Developer',
    company: 'Domclick',
    points: [
      'Monorepo (CRM + Portal) + shared UI → duplication ↓ 50%.',
      'Loan flows → support ↓ 90%, issuance 30d → 30m.',
      'TypeScript adoption → runtime defects ↓ 30%.',
      'Webpack 3→5 → bundle ↓ 40%, build time ↓ 50%.',
      'Forms: Redux-Form → Final-Form → error rate ↓ 30%.',
      'Testing (Jest) → coverage ~79%, regressions ↓ 80%+.',
    ],
  },
];

export const Experience = () => {
  return (
    <div>
      <div className="mb-5 flex items-end justify-between gap-6 px-2 sm:mb-8 sm:px-0">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-lime-500/80">
            Experience
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:mt-3">
            Recent roles and impact
          </h2>
        </div>
      </div>

      <div className="grid gap-4 px-1 sm:px-0 lg:grid-cols-3">
        {timeline.map((item) => (
          <Card key={item.company}>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {item.period}
            </div>
            <h3 className="mt-4 text-xl font-medium text-foreground">
              {item.role}
            </h3>
            <p className="mt-1 text-sm text-sky-500">{item.company}</p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
              {item.points.map((point) => (
                <li key={point} className="flex gap-3">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-lime-500" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
};
