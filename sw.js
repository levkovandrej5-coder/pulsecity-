self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
    let data = {
        title: '⚡ PulseCity',
        body: 'У вас новое событие в приложении',
        target: 'feed',
        partner: ''
    };

    if (event.data) {
        try {
            const parsed = event.data.json();
            data = { ...data, ...parsed };
        } catch (e) {
            data.body = event.data.text() || data.body;
        }
    }

    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: '/icon.png',
            badge: '/icon.png',
            vibrate: [100, 50, 100],
            data: {
                target: data.target || 'feed',
                partner: data.partner || ''
            }
        })
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const payload = event.notification.data || {};

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if ('focus' in client) {
                    client.postMessage({
                        type: 'OPEN_NOTIFICATION',
                        target: payload.target || 'feed',
                        partner: payload.partner || ''
                    });
                    return client.focus();
                }
            }
            if (self.clients.openWindow) {
                return self.clients.openWindow('/');
            }
        })
    );
});

