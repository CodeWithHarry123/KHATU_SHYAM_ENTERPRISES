
import './firebase-init.js';
import './error-handler.js';
import './data-cache.js';
import './invoice-generator.js';
import './chat-widget.js';
import './lazy-loader.js';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, doc, getDoc, query, where, orderBy, getDocs } from 'firebase/firestore';

const auth = getAuth();
const db = getFirestore();

function showBookingSkeleton() {
    const skeletonRow = `
        <tr>
            <td class="px-6 py-4"><div class="skeleton skeleton-text w-3/4"></div></td>
            <td class="px-6 py-4"><div class="skeleton skeleton-text w-1/2"></div></td>
            <td class="px-6 py-4"><div class="skeleton skeleton-text w-full"></div></td>
            <td class="px-6 py-4"><div class="skeleton skeleton-text w-20 h-6 rounded-full"></div></td>
            <td class="px-6 py-4"><div class="skeleton skeleton-text w-1/2"></div></td>
            <td class="px-6 py-4"><div class="skeleton skeleton-text w-24 h-6"></div></td>
        </tr>
    `.repeat(5);

    const skeletonCard = `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-3">
            <div class="flex justify-between items-start">
                <div class="skeleton skeleton-text w-1/4"></div>
                <div class="skeleton skeleton-text w-20 h-6 rounded-full"></div>
            </div>
            <div class="space-y-2">
                <div class="skeleton skeleton-text w-full"></div>
                <div class="skeleton skeleton-text w-1/2"></div>
            </div>
            <div class="skeleton skeleton-text w-1/3 mt-2"></div>
        </div>
    `.repeat(4);

    bookingsTableBody.innerHTML = skeletonRow;
    bookingsCardView.innerHTML = skeletonCard;
}

// --- GLOBAL STATE ---
let allBookings = [];
let currentFilter = 'All';
let currentSearchTerm = '';

// --- ELEMENTS ---
const logoutButton = document.getElementById('logout-button');
const bookingsTableBody = document.getElementById('bookings-table-body');
const bookingsCardView = document.getElementById('bookings-card-view');
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLogoutButton = document.getElementById('mobile-logout-button');
const searchInput = document.getElementById('search-input');
const filterButtonsContainer = document.getElementById('filter-buttons');

// --- AUTHENTICATION & INITIAL LOAD ---
window.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        showBookingSkeleton(); // Show skeleton UI immediately

        try {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                ErrorHandler.show('User data not found. Please contact support.', 'error');
                signOut(auth);
                window.location.href = 'login.html';
                return;
            }

            const userData = userDoc.data();
            console.log('User logged in:', userData);

            if (!userData.name || !userData.address) {
                const profileUpdateModal = document.getElementById('profile-update-modal');
                if (profileUpdateModal) {
                    profileUpdateModal.classList.remove('hidden');
                    profileUpdateModal.classList.add('flex');
                }
            }

            await loadBookings(user.uid);

            const chat = new ChatWidget();
            chat.init();

        } catch (error) {
            ErrorHandler.handleFirebaseError(error);
        }
    });
});

const cache = new DataCache();

async function loadBookings(userId) {
    try {
        const cachedBookings = cache.get(`bookings_${userId}`);
        if (cachedBookings) {
            allBookings = cachedBookings;
            applyFiltersAndSearch();
            return;
        }

        const q = query(collection(db, 'bookings'), where('userId', '==', userId), orderBy('bookingDate', 'desc'));
        const querySnapshot = await getDocs(q);
        allBookings = [];
        querySnapshot.forEach((doc) => {
            allBookings.push({ id: doc.id, ...doc.data() });
        });
        
        cache.set(`bookings_${userId}`, allBookings);
        applyFiltersAndSearch();
    } catch (error) {
        ErrorHandler.handleFirebaseError(error);
        const errorHtml = `<div class="text-center py-10 text-red-500 col-span-full">Error loading bookings.</div>`;
        bookingsTableBody.innerHTML = `<tr><td colspan="6" class="text-center py-10 text-red-500">Error loading bookings.</td></tr>`;
        bookingsCardView.innerHTML = errorHtml;
    }
}

// --- RENDERING & FILTERING LOGIC ---
function applyFiltersAndSearch() {
    let bookingsToRender = [...allBookings];

    // Apply status filter
    if (currentFilter !== 'All') {
        bookingsToRender = bookingsToRender.filter(b => b.status === currentFilter);
    }

    // Apply search term
    if (currentSearchTerm) {
        const searchTerm = currentSearchTerm.toLowerCase();
        bookingsToRender = bookingsToRender.filter(b =>
            (b.bookingId && b.bookingId.toLowerCase().includes(searchTerm)) ||
            (b.receiverDetails.address && b.receiverDetails.address.toLowerCase().includes(searchTerm)) ||
            (b.receiverDetails.pincode && b.receiverDetails.pincode.toLowerCase().includes(searchTerm))
        );
    }

    renderBookings(bookingsToRender);
}

function renderBookings(bookings) {
    bookingsTableBody.innerHTML = '';
    bookingsCardView.innerHTML = '';

    if (bookings.length === 0) {
        const noDataHtml = `<div class="text-center py-10 col-span-full">No bookings match your criteria.</div>`;
        bookingsTableBody.innerHTML = `<tr><td colspan="6" class="text-center py-10">No bookings match your criteria.</td></tr>`;
        bookingsCardView.innerHTML = noDataHtml;
        return;
    }

    bookings.forEach(booking => {
        const bookingDate = booking.bookingDate ? booking.bookingDate.toDate().toLocaleDateString() : 'Processing...';
        const statusClass = getStatusClass(booking.status);

        // Payment Status Styling
        let paymentStatusHtml = '';
        const paymentStatus = booking.paymentStatus || 'N/A';
        switch (paymentStatus.toLowerCase()) {
            case 'paid':
                paymentStatusHtml = `<span class="font-medium text-green-500">Paid</span>`;
                break;
            case 'cos':
                paymentStatusHtml = `<span class="font-medium text-green-500">Cash on Shipping</span>`;
                break;
            case 'pending':
                paymentStatusHtml = `<button class="repay-btn font-medium text-yellow-500 hover:underline cursor-pointer" data-booking-id="${booking.bookingId}" data-amount="${booking.amount || 0}">Pending</button>`;
                break;
            default:
                paymentStatusHtml = `<span class="font-medium text-gray-500">${paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}</span>`;
        }

        const row = `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">${booking.bookingId}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${bookingDate}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${booking.receiverDetails.address}, ${booking.receiverDetails.pincode}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">${booking.status}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${paymentStatusHtml}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <a class="view-details-btn text-primary hover:text-primary-dark dark:text-secondary dark:hover:text-secondary-light flex items-center gap-1" href="#" data-booking-id="${booking.id}">
                        View Details <span class="material-symbols-outlined text-lg">visibility</span>
                    </a>
                </td>
            </tr>
        `;
        bookingsTableBody.innerHTML += row;

        const card = `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-3">
                <div class="flex justify-between items-start">
                    <div class="font-bold text-primary dark:text-secondary text-sm">${booking.bookingId}</div>
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusClass}">${booking.status}</span>
                </div>
                <div class="text-sm">
                    <p class="text-gray-600 dark:text-gray-300">To: ${booking.receiverDetails.address}, ${booking.receiverDetails.pincode}</p>
                    <p class="text-gray-600 dark:text-gray-300">Payment: ${paymentStatusHtml}</p>
                </div>
                <div class="text-xs text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-200 dark:border-gray-700">
                    Booked on: ${bookingDate}
                </div>
                <a class="view-details-btn text-primary hover:text-primary-dark dark:text-secondary dark:hover:text-secondary-light flex items-center gap-1 text-sm font-medium pt-2" href="#" data-booking-id="${booking.id}">
                    View Details <span class="material-symbols-outlined text-base">visibility</span>
                </a>
            </div>
        `;
        bookingsCardView.innerHTML += card;
    });
}

function getStatusClass(status) {
    switch (status) {
        case 'Delivered': return 'bg-delivered/20 text-delivered';
        case 'In Transit': return 'bg-in-transit/20 text-in-transit';
        case 'Booked': default: return 'bg-booked/20 text-booked';
    }
}

// --- REPAYMENT LOGIC ---
const VPA = '123123xxx42@axl';
const PAYEE_NAME = 'Khatu Shyam Enterprises';
const repaymentModal = document.getElementById('repayment-qr-modal');
const repaymentModalClose = document.getElementById('repayment-modal-close-button');

document.body.addEventListener('click', function(event) {
    const repayBtn = event.target.closest('.repay-btn');
    if (repayBtn) {
        event.preventDefault();
        const bookingId = repayBtn.dataset.bookingId;
        const amount = repayBtn.dataset.amount;

        if (!bookingId || !amount || amount === '0') {
            ErrorHandler.show('Could not initiate payment. Amount is zero or data is missing.', 'error');
            return;
        }

        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const upiString = `upi://pay?pa=${VPA}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${amount}&cu=INR&tn=${bookingId}`;

        if (isMobile) {
            // On mobile, redirect to UPI app
            window.location.href = upiString;
        } else {
            // On desktop, show QR code modal
            const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;
            document.getElementById('repayment-qr-container').innerHTML = `<img src="${qrCodeUrl}" alt="UPI QR Code">`;
            document.getElementById('repayment-booking-id').textContent = bookingId;
            document.getElementById('repayment-amount').textContent = amount;
            repaymentModal.classList.remove('hidden');
            repaymentModal.classList.add('flex');
        }
    }
});

repaymentModalClose.addEventListener('click', () => {
    repaymentModal.classList.add('hidden');
    repaymentModal.classList.remove('flex');
});

repaymentModal.addEventListener('click', (e) => {
    if (e.target === repaymentModal) {
        repaymentModal.classList.add('hidden');
        repaymentModal.classList.remove('flex');
    }
});

// --- MODAL ELEMENTS ---
const modal = document.getElementById('booking-modal');
const modalContent = document.getElementById('modal-content');
const modalBody = document.getElementById('modal-body');
const modalCloseButton = document.getElementById('modal-close-button');

// --- MODAL FUNCTIONS ---
function showBookingModal(bookingId) {
    const booking = allBookings.find(b => b.id === bookingId);
    if (!booking) return;

    const bookingDate = booking.bookingDate ? booking.bookingDate.toDate().toLocaleString() : 'N/A';

    modalBody.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
                <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Sender Details</h3>
                <p><strong>Name:</strong> ${booking.senderDetails.name}</p>
                <p><strong>Mobile:</strong> ${booking.senderDetails.mobile}</p>
                <p><strong>Pincode:</strong> ${booking.senderDetails.pincode}</p>
                <p><strong>Address:</strong> ${booking.senderDetails.address}</p>
            </div>
            <div class="space-y-2">
                <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Receiver Details</h3>
                <p><strong>Name:</strong> ${booking.receiverDetails.name}</p>
                <p><strong>Mobile:</strong> ${booking.receiverDetails.mobile}</p>
                <p><strong>Pincode:</strong> ${booking.receiverDetails.pincode}</p>
                <p><strong>Address:</strong> ${booking.receiverDetails.address}</p>
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div class="space-y-2">
                <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Parcel Details</h3>
                <p><strong>Weight:</strong> ${booking.parcelDetails.weight} kg</p>
                <p><strong>Type:</strong> ${booking.parcelDetails.type}</p>
            </div>
            <div class="space-y-2">
                <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Booking Info</h3>
                <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
                <p><strong>Status:</strong> ${booking.status}</p>
                <p><strong>Date:</strong> ${bookingDate}</p>
            </div>
        </div>
        <div class="pt-6 border-t border-gray-200 dark:border-gray-700">
            <button id="generate-invoice-btn" data-booking-id="${booking.id}" class="flex items-center justify-center gap-2 w-full rounded-lg bg-primary px-6 py-3 text-center text-base font-bold text-white shadow-sm transition-all hover:bg-primary/90">
                <span class="material-symbols-outlined">receipt_long</span>
                <span>Generate Invoice</span>
            </button>
        </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => modalContent.classList.remove('scale-95'), 50);
}

function hideBookingModal() {
    modalContent.classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }, 300);
}

// --- EVENT LISTENERS ---
function handleLogout() {
    signOut(auth).then(() => { window.location.href = 'index.html'; });
}

logoutButton.addEventListener('click', handleLogout);
if(mobileLogoutButton) mobileLogoutButton.addEventListener('click', handleLogout);

mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

filterButtonsContainer.addEventListener('click', (e) => {
    const filterBtn = e.target.closest('.filter-btn');
    if (filterBtn) {
        currentFilter = filterBtn.dataset.filter;
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('bg-primary', 'text-white');
            btn.classList.add('bg-white', 'dark:bg-gray-800', 'text-gray-800', 'dark:text-gray-200');
        });
        filterBtn.classList.add('bg-primary', 'text-white');
        filterBtn.classList.remove('bg-white', 'dark:bg-gray-800', 'text-gray-800', 'dark:text-gray-200');
        applyFiltersAndSearch();
    }
});

searchInput.addEventListener('input', (e) => {
    currentSearchTerm = e.target.value;
    applyFiltersAndSearch();
});

modalCloseButton.addEventListener('click', hideBookingModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) { 
        hideBookingModal();
    }
});

document.body.addEventListener('click', function(event) {
    const viewButton = event.target.closest('.view-details-btn');
    if (viewButton) {
        event.preventDefault();
        const bookingId = viewButton.dataset.bookingId;
        showBookingModal(bookingId);
    }

    const invoiceButton = event.target.closest('#generate-invoice-btn');
    if (invoiceButton) {
        const bookingId = invoiceButton.dataset.bookingId;
        const invoiceGenerator = new InvoiceGenerator();
        invoiceGenerator.generateInvoice(bookingId);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    LazyLoader.init();
});
