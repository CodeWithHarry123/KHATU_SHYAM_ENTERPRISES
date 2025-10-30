
import './firebase-init.js';
import './error-handler.js';
import './lazy-loader.js';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import * as XLSX from 'xlsx';

const auth = getAuth();
const db = getFirestore();

// --- AUTHENTICATION ---
onAuthStateChanged(auth, user => {
    if (user) {
        // User is logged in, now check for admin status in Firestore.
        const userDocRef = doc(db, 'users', user.uid);
        getDoc(userDocRef)
            .then((docSnap) => {
                if (docSnap.exists() && docSnap.data().khatu_website_admin) {
                    // User is an admin, allow access and load data.
                    console.log("Admin user authenticated successfully.");
                    initializeReportPage();
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
const logoutButton = document.getElementById('logout-button');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
const generateReportButton = document.getElementById('generate-report-button');
const exportExcelButton = document.getElementById('export-excel-button');
const reportTypeSelect = document.getElementById('report-type');
const dateFromInput = document.getElementById('date-from');
const dateToInput = document.getElementById('date-to');
const reportTitle = document.getElementById('report-title');
const reportTableContainer = document.getElementById('report-table-container');

let currentReportData = [];

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

generateReportButton.addEventListener('click', generateReport);
exportExcelButton.addEventListener('click', exportToExcel);

// Dark Mode Check
if (localStorage.getItem('color-theme') === 'dark') {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark');
}

// --- FUNCTIONS ---
function initializeReportPage() {
    // Set default dates
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    dateToInput.valueAsDate = today;
    dateFromInput.valueAsDate = firstDayOfMonth;

    // Generate initial report
    generateReport();
}

function generateReport() {
    const reportType = reportTypeSelect.value;
    const fromDate = dateFromInput.value ? new Date(dateFromInput.value) : null;
    const toDate = dateToInput.value ? new Date(dateToInput.value) : null;
    if (toDate) toDate.setHours(23, 59, 59, 999); // Include the whole day

    reportTitle.textContent = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`;

    if (reportType === 'bookings') {
        generateBookingsReport(fromDate, toDate);
    } else if (reportType === 'users') {
        generateUsersReport(fromDate, toDate);
    }
}

function generateBookingsReport(fromDate, toDate) {
    let q = collection(db, 'bookings');
    if (fromDate) {
        q = query(q, where('bookingDate', '>=', fromDate));
    }
    if (toDate) {
        q = query(q, where('bookingDate', '<=', toDate));
    }
    q = query(q, orderBy('bookingDate', 'desc'));
    getDocs(q).then(snapshot => {
        currentReportData = [];
        let tableHtml = `
            <table class="w-full text-left responsive-table">
                <thead class="bg-gray-50 dark:bg-gray-800">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Booking ID</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">From</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">To</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
        `;
        if (snapshot.empty) {
            tableHtml += '<tr><td colspan="6" class="text-center py-10">No bookings found for the selected period.</td></tr>';
        } else {
            snapshot.forEach(doc => {
                const booking = { id: doc.id, ...doc.data() };
                currentReportData.push(booking);
                const bookingDate = booking.bookingDate ? booking.bookingDate.toDate().toLocaleDateString() : 'N/A';
                tableHtml += `
                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td data-label="Booking ID" class="px-6 py-4 whitespace-nowrap text-sm">${booking.bookingId}</td>
                        <td data-label="Date" class="px-6 py-4 whitespace-nowrap text-sm">${bookingDate}</td>
                        <td data-label="Customer" class="px-6 py-4 whitespace-nowrap text-sm">${booking.senderDetails.name}</td>
                        <td data-label="From" class="px-6 py-4 whitespace-nowrap text-sm">${booking.senderDetails.pincode}</td>
                        <td data-label="To" class="px-6 py-4 whitespace-nowrap text-sm">${booking.receiverDetails.pincode}</td>
                        <td data-label="Status" class="px-6 py-4 whitespace-nowrap text-sm">${booking.status}</td>
                    </tr>
                `;
            });
        }
        tableHtml += '</tbody></table>';
        reportTableContainer.innerHTML = tableHtml;
    }).catch(error => console.error("Error fetching bookings report: ", error));
}

function generateUsersReport(fromDate, toDate) {
    let q = collection(db, 'users');
    if (fromDate) {
        q = query(q, where('createdAt', '>=', fromDate));
    }
    if (toDate) {
        q = query(q, where('createdAt', '<=', toDate));
    }
    q = query(q, orderBy('createdAt', 'desc'));
    getDocs(q).then(snapshot => {
        currentReportData = [];
        let tableHtml = `
            <table class="w-full text-left responsive-table">
                <thead class="bg-gray-50 dark:bg-gray-800">
                    <tr>
                        <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User Info</th>
                        <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Registration Date</th>
                        <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
        `;
        if (snapshot.empty) {
            tableHtml += '<tr><td colspan="3" class="text-center py-10">No users found for the selected period.</td></tr>';
        } else {
            snapshot.forEach(doc => {
                const user = doc.data();
                currentReportData.push(user);
                const registrationDate = user.createdAt ? user.createdAt.toDate().toLocaleDateString() : 'N/A';
                const isAdmin = user.isAdmin === true;
                tableHtml += `
                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td data-label="User Info" class="px-6 py-4 whitespace-nowrap">
                            <div class="text-base font-medium">${user.name || 'N/A'}</div>
                            <div class="text-sm text-gray-500">${user.phoneNumber}</div>
                        </td>
                        <td data-label="Registration Date" class="px-6 py-4 whitespace-nowrap text-sm">${registrationDate}</td>
                        <td data-label="Role" class="px-6 py-4 whitespace-nowrap text-sm">${isAdmin ? 'Admin' : 'User'}</td>
                    </tr>
                `;
            });
        }
        tableHtml += '</tbody></table>';
        reportTableContainer.innerHTML = tableHtml;
    }).catch(error => console.error("Error fetching users report: ", error));
}

function exportToExcel() {
    if (currentReportData.length === 0) {
        alert("No data to export.");
        return;
    }
    const reportType = reportTypeSelect.value;
    let dataToExport;
    if (reportType === 'bookings') {
        dataToExport = currentReportData.map(b => ({
            'Booking ID': b.bookingId,
            'Date': b.bookingDate.toDate().toLocaleString(),
            'Status': b.status,
            'Sender Name': b.senderDetails.name,
            'Sender Mobile': b.senderDetails.mobile,
            'Sender Address': b.senderDetails.address,
            'Sender Pincode': b.senderDetails.pincode,
            'Receiver Name': b.receiverDetails.name,
            'Receiver Mobile': b.receiverDetails.mobile,
            'Receiver Address': b.receiverDetails.address,
            'Receiver Pincode': b.receiverDetails.pincode,
        }));
    } else {
         dataToExport = currentReportData.map(u => ({
            'Name': u.name || 'N/A',
            'Phone Number': u.phoneNumber,
            'Registration Date': u.createdAt.toDate().toLocaleString(),
            'Role': u.isAdmin ? 'Admin' : 'User'
        }));
    }

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${reportTitle.textContent}`);
    XLSX.writeFile(workbook, `KhatuShyam_${reportTitle.textContent.replace(/ /g, '_')}.xlsx`);
}

document.addEventListener('DOMContentLoaded', () => {
    LazyLoader.init();
});
