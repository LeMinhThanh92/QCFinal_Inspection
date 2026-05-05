self.addEventListener("push", (event) => {
    const data = event.data.json();

    const options = {
        body: data.body,
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-96.png",
        data: {
            url: data.url
        },
        tag: crypto.randomUUID(),
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    event.waitUntil(clients.openWindow(event.notification.data.url));
});