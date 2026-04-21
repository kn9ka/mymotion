import notoSansLatinWoff2 from '@fontsource-variable/noto-sans/files/noto-sans-latin-wght-normal.woff2';
import playfairDisplayLatinWoff2 from '@fontsource-variable/playfair-display/files/playfair-display-latin-wght-normal.woff2';

export const getSiteMeta = () => {
  return [
    { title: 'knyaka.dev' },
    { name: 'description', content: 'knyaka.dev' },
    { name: 'robots', content: 'index,follow' },
  ];
};

export const getSiteLinks = () => {
  return [
    { rel: 'icon', href: '/favicon.ico' },
    { rel: 'canonical', href: 'https://knyaka.dev' },
    {
      rel: 'preload',
      href: notoSansLatinWoff2,
      as: 'font',
      type: 'font/woff2',
      crossOrigin: 'anonymous',
    },
    {
      rel: 'preload',
      href: playfairDisplayLatinWoff2,
      as: 'font',
      type: 'font/woff2',
      crossOrigin: 'anonymous',
    },
  ];
};
