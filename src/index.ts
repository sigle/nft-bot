import { handleRequest } from './handler';

// addEventListener('fetch', (event) => {
//   event.respondWith(handleRequest());
// });

addEventListener('scheduled', (event) => {
  event.waitUntil(handleRequest());
});
