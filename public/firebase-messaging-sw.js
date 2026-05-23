// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize Firebase compat in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyDESCa7MNP_h8aVNPDcv1eBJ7pJD8Pqm-M",
  authDomain: "thebe-institute.firebaseapp.com",
  projectId: "thebe-institute",
  storageBucket: "thebe-institute.firebasestorage.app",
  messagingSenderId: "818338205348",
  appId: "1:818338205348:web:0bccb60683a52d7917e031"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background push notification payload: ', payload);

  const notificationTitle = payload.notification?.title || "تنبيه جديد 🔔";
  const notificationOptions = {
    body: payload.notification?.body || "لديك رسالة جديدة في تطبيق الطلاب طيبة.",
    icon: '/logo.jpg',
    badge: '/logo.jpg',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Listener for clicks on notifications
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  // Open the web application upon click
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      return clients.openWindow('/');
    })
  );
});
