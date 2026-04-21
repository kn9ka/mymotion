import type { PropsWithChildren } from 'react';

import { AnalyticsProvider } from '@/app/providers/analytics';
import { ThemeProvider } from '@/app/providers/theme';

export const AppProviders = ({ children }: PropsWithChildren) => {
  return (
    <>
      <ThemeProvider>{children}</ThemeProvider>
      <AnalyticsProvider />
    </>
  );
};
