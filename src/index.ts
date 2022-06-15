import Toucan from 'toucan-js';
import { handleRequest } from './handler';

addEventListener('fetch', (event) => {
  const sentry = new Toucan({
    dsn: SENTRY_DSN,
    context: event,
  });

  event.respondWith(
    (async function () {
      try {
        return await handleRequest();
      } catch (err) {
        const sentryId = sentry.captureException(err);
        return new Response(`Internal server error. Event ID: ${sentryId}`, {
          status: 500,
        });
      }
    })()
  );
});

addEventListener('scheduled', (event) => {
  const sentry = new Toucan({
    dsn: SENTRY_DSN,
    context: event,
  });

  event.waitUntil(
    (async function () {
      try {
        return await handleRequest();
      } catch (err) {
        const sentryId = sentry.captureException(err);
        return new Response(`Internal server error. Event ID: ${sentryId}`, {
          status: 500,
        });
      }
    })()
  );
});
