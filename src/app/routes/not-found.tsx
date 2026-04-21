import { useNavigate } from 'react-router';

import { NotFound } from '@/pages/not-found';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const goBack = () => navigate(-1);

  return <NotFound onBack={goBack} />;
};

export function loader() {
  throw new Response('Not Found', {
    status: 404,
    headers: {
      'X-Robots-Tag': 'noindex',
    },
  });
}

export default function NotFoundRoute() {
  return <NotFoundPage />;
}

export function ErrorBoundary() {
  return <NotFoundPage />;
}
