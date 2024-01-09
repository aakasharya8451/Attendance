self.addEventListener('push', event => {
    const options = {
        body: 'Mark Attendance Now',
        icon: '/icons/maskable/maskable_icon.png',
    };

    event.waitUntil(
        self.registration.showNotification('Reminder', options)
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    clients.openWindow('/'); // Open your PWA's main page
});

// Schedule the first notification
function scheduleNotification() {
    const now = new Date();
    const notificationTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        21,  // 9 pm
        0,   // Minutes
        0,   // Seconds
        0    // Milliseconds
    );

    // Adjust for IST (UTC+5:30)
    notificationTime.setHours(notificationTime.getHours() + 5);
    notificationTime.setMinutes(notificationTime.getMinutes() + 30);

    const timeUntilNotification = notificationTime - now;

    setTimeout(() => {
        // Trigger a push notification
        self.registration.showNotification('Reminder', {
            body: 'Mark Attendance Now',
            icon: '/icons/maskable/maskable_icon.png',
        });

        // Schedule the next notification
        scheduleNotification();
    }, timeUntilNotification);
}

// Call the function to schedule the first notification
scheduleNotification();
