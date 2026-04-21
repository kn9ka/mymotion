import type { PropsWithChildren } from 'react';

import { BackgroundPaths } from '@/shared/ui/shadcn/background-paths';

export const AppShell = ({ children }: PropsWithChildren) => {
  return (
    <div className="relative isolate min-h-dvh">
      <BackgroundPaths />
      <div className="relative z-10">{children}</div>
    </div>
  );
};
