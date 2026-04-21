import { Card } from '@/shared/ui/Card';
import { GithubIcon } from '@/shared/ui/shadcn/icons';

const experiments = [
  {
    title: 'Vocabulary trainer',
    desc: 'Learn. Train. No frameworks.',
    stack: ['Webpack', 'TS'],
    link: 'https://vocabulary-trainer.knyaka.dev',
    github: 'https://github.com/kn9ka/vocabulary-trainer',
  },
  {
    title: 'Voice memos',
    desc: 'Audio capture, simple sync.',
    stack: ['Web APIs', 'React'],
    link: 'https://voice-memos.knyaka.dev',
    github: 'https://github.com/kn9ka/my-voice-memos',
  },
  {
    title: 'Exchange rates',
    desc: 'Aggregated exchangers data',
    stack: ['Node', 'APIs', 'Svelte'],
    link: 'https://exchange-rates.knyaka.dev',
    github: 'https://github.com/kn9ka/exchange-rates',
  },
];
export const OtherProjects = () => {
  return (
    <div>
      <div className="mb-5 px-2 sm:mb-8 sm:px-0">
        <p className="text-sm uppercase tracking-[0.24em] text-sky-500/80">
          My projects
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:mt-3">
          Side projects & experiments
        </h2>
      </div>

      <div className="grid gap-5 px-1 sm:px-0 md:grid-cols-2 lg:grid-cols-3">
        {experiments.map((p) => (
          <Card key={p.title} className="group" interactive>
            <h3 className="text-lg font-medium text-foreground">{p.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {p.stack.map((t) => (
                  <span
                    key={t}
                    className="rounded-md border border-border/70 bg-background/70 px-2.5 py-1 text-xs text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={p.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${p.title} source on GitHub`}
                  className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-background/70 p-1 text-[11px] font-medium text-foreground/84 transition hover:border-border hover:bg-foreground/5"
                >
                  <GithubIcon />
                </a>
                <a
                  href={p.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${p.title}`}
                  className="inline-flex items-center gap-1 rounded-md border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-[11px] font-medium text-sky-700 transition hover:border-sky-500/50 hover:bg-sky-500/15 dark:text-sky-100"
                >
                  Open
                  <span className="opacity-60">→</span>
                </a>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
