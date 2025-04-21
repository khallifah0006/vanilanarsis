// service worker nya ada di file dist berikut codenya :kalau seandainya dist hilang :

self.addEventListener('push', (event) => {
  if (!event.data) return;

  const notificationData = event.data.json();

  const notificationOptions = {
      body: notificationData.options.body,
      icon: '/icon.png',
      badge: '/badge.png',
      vibrate: [100, 50, 100],
      data: { url: '/' },
      actions: [{ action: 'open', title: 'Open Story' }]
  };

  event.waitUntil(
      self.registration.showNotification(notificationData.title, notificationOptions)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});

self.addEventListener('install', (event) => {
    self.skipWaiting();
  });
  
  self.addEventListener('activate', (event) => {
    return self.clients.claim();
  });
  
  self.addEventListener('push', (event) => {
    if (!event.data) return;
  
    const notificationData = event.data.json();
    
    const notificationOptions = {
      body: notificationData.options.body,
      icon: '/icon.png',
      badge: '/badge.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      },
      actions: [
        {
          action: 'view',
          title: 'View Story'
        }
      ]
    };
    navigator.serviceWorker.register('service-worker.js')
    .then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
    })
    .catch((error) => {
        console.error('Service Worker registration failed:', error);
    });

    event.waitUntil(
      self.registration.showNotification(notificationData.title, notificationOptions)
    );
  });
  
  self.addEventListener('notificationclick', (event) => {
    event.notification.close();
  
    if (event.action === 'view') {
      
      event.waitUntil(
        clients.openWindow('/#/')
      );
    } else {
      
      event.waitUntil(
        clients.openWindow('/#/')
      );
    }
  });