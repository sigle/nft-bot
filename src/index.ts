import * as Sentry from '@sentry/browser';
import { handleRequest } from './handler';

Sentry.init({
  dsn: SENTRY_DSN,
});

// addEventListener('fetch', (event) => {
//   event.respondWith(handleRequest());
// });

addEventListener('scheduled', (event) => {
  event.waitUntil(
    (async function () {
      try {
        return await handleRequest();
      } catch (error) {
        Sentry.captureException(error);
        await Sentry.flush(2000);
        return new Response('Internal server error', {
          status: 500,
        });
      }
    })()
  );
});
