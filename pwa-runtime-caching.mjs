const runtimeCaching = [
  {
    urlPattern: /\/api\/.*/i,
    handler: "NetworkOnly"
  },
  {
    urlPattern: ({ sameOrigin, request }) => sameOrigin && request.mode === "navigate",
    handler: "CacheFirst",
    options: {
      cacheName: "app-pages",
      expiration: {
        maxEntries: 20,
        maxAgeSeconds: 60 * 60 * 24 * 30
      },
      cacheableResponse: {
        statuses: [200]
      }
    }
  },
  {
    urlPattern: ({ sameOrigin, request }) => sameOrigin && request.destination === "image",
    handler: "CacheFirst",
    options: {
      cacheName: "images",
      expiration: {
        maxEntries: 80,
        maxAgeSeconds: 60 * 60 * 24 * 30
      },
      cacheableResponse: {
        statuses: [200]
      }
    }
  },
  {
    urlPattern: /\/_next\/static\/.*/i,
    handler: "CacheFirst",
    options: {
      cacheName: "static-assets",
      expiration: {
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 30
      }
    }
  },
  {
    urlPattern: /^https?.*/,
    handler: "NetworkFirst",
    options: {
      cacheName: "http-cache",
      expiration: {
        maxEntries: 200,
        maxAgeSeconds: 60 * 60 * 24 * 30
      },
      networkTimeoutSeconds: 10
    }
  }
];

export default runtimeCaching;
