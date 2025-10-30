
import './firebase-init.js';
import './error-handler.js';
import './lazy-loader.js';
import { getFirestore } from 'firebase/firestore';
import { TrackingSystem } from './tracking-system.js';

const db = getFirestore();

function initTracking() {
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('bookingId');

    if (bookingId) {
        document.getElementById('booking-id-display').textContent = `Booking ID: ${bookingId}`;
        const tracker = new TrackingSystem(bookingId, db);
        tracker.startTracking();
    } else {
        document.getElementById('tracking-status').textContent = 'No booking ID provided.';
        document.getElementById('tracking-eta').textContent = '-';
        document.getElementById('booking-id-display').textContent = 'Please provide a booking ID in the URL.';
    }
}

window.initTracking = initTracking;

document.addEventListener('DOMContentLoaded', () => {
    LazyLoader.init();
});
