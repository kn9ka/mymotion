import { Card } from '@/shared/ui/Card';

export const Gamer = () => {
  return (
    <div className="px-1 sm:px-0">
      <Card className="p-4 lg:p-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-sky-500/80">
              Side identity
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:mt-3">
              Gaming mindset, applied to systems.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-muted-foreground">
              Competitive games shaped how I approach systems: clarity, fast
              feedback loops, and decision-making under pressure. I bring the
              same mindset into frontend architecture and product work.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex gap-3">
              {[
                { value: '60k+', label: 'hours played' },
                { value: '20+', label: 'years gaming' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-border/70 bg-background/70 px-4 py-3 shadow-sm"
                >
                  <div className="text-lg font-semibold text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              {[
                'Counter-Strike',
                'Dota 2',
                'Lineage 2',
                'WoW',
                'EVE Online',
                'Hades',
                'PUBG',
              ].map((game) => (
                <span
                  key={game}
                  className="rounded-lg border border-border/70 bg-background/70 px-4 py-2 text-sm text-muted-foreground"
                >
                  {game}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
