import type { ComponentPropsWithoutRef } from 'react';

import { cn } from '@/shared/lib/utils';

type CardProps = ComponentPropsWithoutRef<'div'> & {
  interactive?: boolean;
};

export const Card = ({
  children,
  className,
  interactive = false,
  ...props
}: CardProps) => {
  return (
    <div
      className={cn(
        'relative isolate overflow-hidden rounded-2xl border border-border/70 bg-card/70 p-4 backdrop-blur-xl dark:shadow-black/20 lg:p-5',
        interactive &&
          'transition-transform duration-300 hover:-translate-y-1 hover:border-sky-500/20',
        className,
      )}
      {...props}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-100 bg-[radial-gradient(circle_at_center,rgba(82,82,91,0.18)_0.9px,transparent_1px)] bg-position-[0_0] bg-size-[18px_18px] mask-[linear-gradient(to_bottom,rgba(0,0,0,0.95),rgba(0,0,0,0.55)_72%,transparent)] dark:bg-[radial-gradient(circle_at_center,rgba(161,161,170,0.16)_0.9px,transparent_1px)]"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};
