importScripts("/precache-manifest.521b947b80ad2515a2e54bea31a0f870.js", "/workbox-v4.3.1/workbox-sw.js");
workbox.setConfig({modulePathPrefix: "/workbox-v4.3.1"});
// This is the code piece that GenerateSW mode can't provide for us.
// This code listens for the user's confirmation to update the app.
workbox.loadModule('workbox-routing');
workbox.loadModule('workbox-strategies');


workbox.core.setCacheNameDetails({prefix: "v0"});

self.addEventListener('message', (e) => {
  if (!e.data) {
    return;
  }

  switch (e.data) {
    case 'skipWaiting':
      self.skipWaiting();
      break;
    default:
      // NOOP
      break;
  }
});

const router = new workbox.routing.Router();
function matcher ({url}) {
  let allowed = [
    `${self.location.protocol}//${self.location.hostname}/`,
    `${self.location.protocol}//${self.location.hostname}:${self.location.port}/`,
  ]
  return allowed.filter((p) => { url.href.startsWith(p)}).length > 0
}
var route = new workbox.routing.Route(
  matcher,
  new workbox.strategies.NetworkFirst({
    cacheName: "tempo-cache"
  })
)
router.registerRoute(route)
router.addCacheListener()
router.addFetchListener()

// The precaching code provided by Workbox.
self.__precacheManifest = [].concat(self.__precacheManifest || []);

// workbox.precaching.suppressWarnings(); // Only used with Vue CLI 3 and Workbox v3.
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

