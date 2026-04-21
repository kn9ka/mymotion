import type { PropsWithChildren } from 'react';
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';

import { getThemeInitScript } from '@/shared/lib/theme';

import { getSiteLinks, getSiteMeta } from '@/app/config';
import { AppProviders } from '@/app/providers';
import { AppShell } from '@/app/ui';

import './app.css';

export const meta = getSiteMeta;

export const links = getSiteLinks;

export const Layout = ({ children }: PropsWithChildren) => {
  return (
    <html
      lang="en"
      className="overflow-x-hidden scroll-smooth"
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          dangerouslySetInnerHTML={{
            __html: getThemeInitScript(),
          }}
        />
        <Meta />
        <Links />
      </head>
      <body className="overflow-x-hidden">
        {children}

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
};

export default function App() {
  return (
    <AppProviders>
      <AppShell>
        <Outlet />
      </AppShell>
    </AppProviders>
  );
}
