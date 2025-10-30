import './style.css';
import { auth, db } from './firebase-init.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
import * as XLSX from 'xlsx';

// --- AUTHENTICATION ---
onAuthStateChanged(auth, user => {
    if (user) {
        // User is logged in, now check for admin status in Firestore.
        const userDocRef = doc(db, 'users', user.uid);
        getDoc(userDocRef)
            .then((doc) => {
                if (doc.exists() && doc.data().khatu_website_admin) {
                    // User is an admin, allow access and load data.
                    console.log("Admin user authenticated successfully.");
                    document.getElementById('admin-content-wrapper').style.display = 'flex';
                    loadAllBookings();
                } else {
                    // User is not an admin, redirect them.
                    console.log("Access Denied: User is not an admin.");
                    alert("Access Denied. You do not have permission to view this page.");
                    window.location.href = 'dashboard.html'; // Redirect to dashboard
                }
            })
            .catch((error) => {
                console.error("Error getting user document:", error);
                window.location.href = 'login.html'; // Redirect on error
            });
    } else {
        // No user is signed in, redirect to login.
        console.log("No user logged in. Redirecting to login.");
        window.location.href = 'login.html';
    }
});

// --- UI ELEMENTS ---
const bookingsTableBody = document.getElementById('admin-bookings-table-body');
const bookingsCardView = document.getElementById('admin-bookings-card-view');
const downloadExcelButton = document.getElementById('download-excel-button');
const printButton = document.getElementById('print-button');
const logoutButton = document.getElementById('logout-button');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
const modal = document.getElementById('booking-modal');
const modalContent = document.getElementById('modal-content');
const modalBody = document.getElementById('modal-body');
const modalCloseButton = document.getElementById('modal-close-button');
const searchInput = document.getElementById('search-input');

let allBookingsData = [];

// --- MODAL FUNCTIONS ---
function showBookingModal(bookingId) {
    const booking = allBookingsData.find(b => b.id === bookingId);
    if (!booking) return;

    const bookingDate = booking.bookingDate ? booking.bookingDate.toDate().toLocaleString() : 'N/A';

    modalBody.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Sender Details -->
            <div class="space-y-2">
                <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Sender Details</h3>
                <p><strong>Name:</strong> ${booking.senderDetails.name}</p>
                <p><strong>Mobile:</strong> ${booking.senderDetails.mobile}</p>
                <p><strong>Pincode:</strong> ${booking.senderDetails.pincode}</p>
                <p><strong>Address:</strong> ${booking.senderDetails.address}</p>
            </div>
            <!-- Receiver Details -->
            <div class="space-y-2">
                <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Receiver Details</h3>
                <p><strong>Name:</strong> ${booking.receiverDetails.name}</p>
                <p><strong>Mobile:</strong> ${booking.receiverDetails.mobile}</p>
                <p><strong>Pincode:</strong> ${booking.receiverDetails.pincode}</p>
                <p><strong>Address:</strong> ${booking.receiverDetails.address}</p>
            </div>
        </div>
         <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <!-- Parcel Details -->
            <div class="space-y-2">
                <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Parcel Details</h3>
                <p><strong>Weight:</strong> ${booking.parcelDetails.weight} kg</p>
                <p><strong>Size:</strong> ${booking.parcelDetails.size || 'N/A'}</p>
                <p><strong>Type:</strong> ${booking.parcelDetails.type}</p>
            </div>
            <!-- Booking Info -->
            <div class="space-y-2">
                <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Booking Info</h3>
                <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
                <p><strong>Status:</strong> ${booking.status}</p>
                <p><strong>Date:</strong> ${bookingDate}</p>
                <p><strong>User ID:</strong> ${booking.userId}</p>
            </div>
        </div>
        <div class="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Update Status</h3>
            <div class="mt-4 flex items-center gap-4">
                <select id="status-select" class="form-select w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-primary focus:ring-primary">
                    <option value="Booked" ${booking.status === 'Booked' ? 'selected' : ''}>Booked</option>
                    <option value="In Transit" ${booking.status === 'In Transit' ? 'selected' : ''}>In Transit</option>
                    <option value="Delivered" ${booking.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                </select>
                <button id="update-status-button" data-booking-id="${booking.id}" class="flex items-center justify-center h-10 px-6 rounded-lg bg-primary text-white text-sm font-bold">Update</button>
            </div>
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
sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('-translate-x-full');
});

logoutButton.addEventListener('click', (e) => {
    e.preventDefault();
    signOut(auth).then(() => {
        window.location.href = 'index.html';
    });
});

printButton.addEventListener('click', () => window.print());
modalCloseButton.addEventListener('click', hideBookingModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) { // Clicked on the overlay
        hideBookingModal();
    }
});

searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const filteredBookings = allBookingsData.filter(booking => {
        const customerName = (booking.senderDetails.name || '').toLowerCase();
        const bookingId = (booking.bookingId || '').toLowerCase();
        const senderPincode = (booking.senderDetails.pincode || '').toLowerCase();
        const receiverPincode = (booking.receiverDetails.pincode || '').toLowerCase();
        const status = (booking.status || '').toLowerCase();

        return customerName.includes(searchTerm) ||
               bookingId.includes(searchTerm) ||
               senderPincode.includes(searchTerm) ||
               receiverPincode.includes(searchTerm) ||
               status.includes(searchTerm);
    });
    renderBookings(filteredBookings);
});

// Dark Mode Check
if (localStorage.getItem('color-theme') === 'dark') {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark');
}

// Event delegation for viewing bookings and updating status
document.body.addEventListener('click', function(event) {
    const viewButton = event.target.closest('.view-booking-button');
    if (viewButton) {
        const bookingId = viewButton.dataset.bookingId;
        showBookingModal(bookingId);
        return; // Stop further execution
    }

    const updateButton = event.target.closest('#update-status-button');
    if (updateButton) {
        const bookingId = updateButton.dataset.bookingId;
        const newStatus = document.getElementById('status-select').value;
        const bookingDocRef = doc(db, 'bookings', bookingId);
        updateDoc(bookingDocRef, { status: newStatus })
            .then(() => {
                alert('Status updated successfully!');
                hideBookingModal();
                loadAllBookings(); // Refresh the list
            })
            .catch(error => {
                console.error('Error updating status: ', error);
                alert('Error updating status.');
            });
    }
});

downloadExcelButton.addEventListener('click', () => {
    if (allBookingsData.length === 0) {
        alert("No data to export.");
        return;
    }
    const flattenedData = allBookingsData.map(booking => ({
        'Booking ID': booking.bookingId,
        'Booking Date': booking.bookingDate ? booking.bookingDate.toDate().toLocaleString() : 'N/A',
        'Status': booking.status,
        'Sender Name': booking.senderDetails.name,
        'Sender Mobile': booking.senderDetails.mobile,
        'Sender Address': booking.senderDetails.address,
        'Sender Pincode': booking.senderDetails.pincode,
        'Receiver Name': booking.receiverDetails.name,
        'Receiver Mobile': booking.receiverDetails.mobile,
        'Receiver Address': booking.receiverDetails.address,
        'Receiver Pincode': booking.receiverDetails.pincode,
        'Parcel Weight (kg)': booking.parcelDetails.weight,
        'Parcel Size (cm)': booking.parcelDetails.size,
        'Parcel Type': booking.parcelDetails.type,
        'User ID': booking.userId
    }));
    const worksheet = XLSX.utils.json_to_sheet(flattenedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");
    XLSX.writeFile(workbook, "KhatuShyam_Bookings.xlsx");
});

// --- DATA LOADING ---
function getStatusClass(status) {
    switch (status) {
        case 'Delivered': return 'bg-green-100 text-green-800';
        case 'In Transit': return 'bg-yellow-100 text-yellow-800';
        case 'Booked': default: return 'bg-blue-100 text-blue-800';
    }
}

function renderBookings(bookings) {
    bookingsTableBody.innerHTML = '';
    bookingsCardView.innerHTML = '';

    if (bookings.length === 0) {
        const noDataHtml = `<p class="text-center py-10 col-span-full">No bookings match your criteria.</p>`;
        bookingsTableBody.innerHTML = `<tr><td colspan="7">${noDataHtml}</td></tr>`;
        bookingsCardView.innerHTML = noDataHtml;
        return;
    }

    bookings.forEach((booking) => {
        const bookingDate = booking.bookingDate ? booking.bookingDate.toDate().toLocaleDateString() : 'N/A';
        const statusClass = getStatusClass(booking.status);

        // --- Create Desktop Table Row ---
        const tableRow = document.createElement('tr');
        tableRow.className = 'hover:bg-gray-50 dark:hover:bg-gray-800';
        tableRow.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${booking.bookingId || 'N/A'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-light dark:text-text-dark">${booking.senderDetails.name || 'N/A'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${booking.senderDetails.pincode}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${booking.receiverDetails.pincode}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${bookingDate}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusClass}">${booking.status || 'N/A'}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <button class="view-booking-button font-medium text-primary dark:text-secondary hover:underline" data-booking-id="${booking.id}">View</button>
            </td>`;

        // --- Create Mobile Card ---
 const card = document.createElement('div');
        card.className = 'view-booking-button bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-3 cursor-pointer hover:shadow-md transition-shadow';
        card.dataset.bookingId = booking.id;

        card.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="font-bold text-primary dark:text-secondary">${booking.bookingId || 'N/A'}</div>
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusClass}">${booking.status || 'N/A'}</span>
            </div>
            <div class="text-sm">
                <p class="font-medium text-gray-800 dark:text-gray-200">${booking.senderDetails.name}</p>
                <p class="text-gray-500 dark:text-gray-400">From: ${booking.senderDetails.pincode} ⟶ To: ${booking.receiverDetails.pincode}</p>
            </div>
            <div class="text-xs text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-200 dark:border-gray-700">
                Booked on: ${bookingDate}
            </div>`;

        bookingsTableBody.appendChild(tableRow);
        bookingsCardView.appendChild(card);
    });
}

async function loadAllBookings() {
    const bookingsCollectionRef = collection(db, 'bookings');
    const q = query(bookingsCollectionRef, orderBy('bookingDate', 'desc'));
    try {
        const querySnapshot = await getDocs(q);
        allBookingsData = [];
        querySnapshot.forEach((doc) => {
            allBookingsData.push({ id: doc.id, ...doc.data() });
        });
        renderBookings(allBookingsData);
    } catch (error) {
        console.error("Error getting documents: ", error);
        const errorHtml = `<p class="text-center py-10 text-red-500 col-span-full">Error loading bookings. Check console and Firestore rules.</p>`;
        bookingsTableBody.innerHTML = `<tr><td colspan="7">${errorHtml}</td></tr>`;
        bookingsCardView.innerHTML = errorHtml;
    }
}
