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

    // Adjust to Indian time zone (Indian Standard Time is UTC+5:30)
    const indianTime = new Date(now.getTime() + 330 * 60 * 1000);

    const dayOfWeek = indianTime.getDay(); // Sunday is 0, Monday is 1, ..., Saturday is 6

    // Check if the current day is Monday to Friday (1 to 5)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        const notificationTime = new Date(
            indianTime.getFullYear(),
            indianTime.getMonth(),
            indianTime.getDate(),
            21,  // 9 pm
            0,   // Minutes
            0,   // Seconds
            0    // Milliseconds
        );

        const timeUntilNotification = notificationTime - indianTime;

        setTimeout(() => {
            // Trigger a push notification
            self.registration.showNotification('PWA Reminder', {
                body: 'Don\'t forget to open your PWA!',
                icon: '/path/to/notification-icon.png',
            });

            // Schedule the next notification
            scheduleNotification();
        }, timeUntilNotification);
    } else {
        // If it's not a weekday, schedule the next notification for the next Monday
        const nextMonday = new Date(indianTime.getTime());

        nextMonday.setDate(indianTime.getDate() + (1 + 7 - dayOfWeek) % 7);
        nextMonday.setHours(21, 0, 0, 0);

        const timeUntilNextMonday = nextMonday - indianTime;

        setTimeout(() => {
            // Schedule the next notification for the next Monday
            scheduleNotification();
        }, timeUntilNextMonday);
    }
}

// Call the function to schedule the first notification
scheduleNotification();
