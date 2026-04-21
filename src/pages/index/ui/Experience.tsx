import { Card } from '@/shared/ui/Card';

const timeline = [
  {
    period: '2024 - now',
    role: 'Senior Frontend Engineer',
    company: 'Holland & Barrett',
    points: [
      'FSD rollout (RFC, templates, CI).',
      'Next.js → Remix rewrite.',
      'SSR/hydration fixes, unified rendering.',
    ],
  },
  {
    period: '2023 - 2024',
    role: 'Frontend Developer',
    company: 'Impress',
    points: ['Priority booking, scheduler.', 'RBAC, i18n workflow.'],
  },
  {
    period: '2019 - 2023',
    role: 'Senior Web Developer',
    company: 'Domclick',
    points: ['Monorepo, shared UI.', 'Loan features, support ↓.'],
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
