
import './firebase-init.js';
import './error-handler.js';
import './admin-analytics.js';
import './lazy-loader.js';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import Chart from 'chart.js/auto';

const auth = getAuth();
const db = getFirestore();

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };
    const icons = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
    };

    const toast = document.createElement('div');
    toast.className = `${colors[type]} text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 animate-slide-in`;
    toast.innerHTML = `
        <span class="text-2xl">${icons[type]}</span>
        <span class="font-medium">${message}</span>
        <button onclick="this.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">✕</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('animate-slide-out');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// --- AUTHENTICATION ---
onAuthStateChanged(auth, user => {
    if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        getDoc(userDocRef)
            .then((docSnap) => {
                if (docSnap.exists() && docSnap.data().role === 'admin') {
                    console.log("Admin user authenticated successfully.");
                    loadDashboard();
                } else {
                    console.log("Access Denied: User is not an admin.");
                    showToast("Access Denied. You do not have permission to view this page.", "error");
                    window.location.href = 'dashboard.html';
                }
            })
            .catch((error) => {
                console.error("Error getting user document:", error);
                window.location.href = 'login.html';
            });
    } else {
        console.log("No user logged in. Redirecting to login.");
        window.location.href = 'login.html';
    }
});

// --- UI ELEMENTS ---
const logoutButton = document.getElementById('logout-button');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');

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

// Dark Mode Check
if (localStorage.getItem('color-theme') === 'dark') {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark');
}

// --- DASHBOARD LOADING ---
async function loadDashboard() {
    const analytics = new AdminAnalytics(Chart);
    try {
        const data = await analytics.getDashboardData();
        analytics.renderDashboard(data);
    } catch (error) {
        console.error("Error loading dashboard data:", error);
        showToast("Could not load dashboard data.", "error");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    LazyLoader.init();
});
