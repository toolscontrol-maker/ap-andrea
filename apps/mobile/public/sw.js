// Service Worker for Andrea & Tonet PWA Push Notifications
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Listen for Push Notifications from backend / Supabase
self.addEventListener('push', (event) => {
  let data = {
    title: 'Andrea & Tonet ❤️',
    body: 'Tienes una nueva actualización de amor.',
    icon: '/assets/icon.png',
    badge: '/assets/icon.png',
    tag: 'andrea-notification',
    url: '/',
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    } catch {
      data.body = event.data.text() || data.body;
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/assets/icon.png',
    badge: data.badge || '/assets/icon.png',
    tag: data.tag || 'andrea-alert',
    data: {
      url: data.url || '/',
      timestamp: Date.now(),
    },
    vibrate: [200, 100, 200, 100, 400],
    requireInteraction: false,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Listen for Notification click to bring app to foreground
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            if ('navigate' in client && targetUrl !== '/') {
              client.navigate(targetUrl);
            }
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});
