
import './firebase-init.js';
import './error-handler.js';
import './backup-system.js';
import './lazy-loader.js';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const auth = getAuth();
const db = getFirestore();

// --- AUTHENTICATION ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists() && userDoc.data().khatu_website_admin) {
                console.log("Admin user authenticated successfully.");
            } else {
                ErrorHandler.show("Access Denied. You do not have permission to view this page.", "error");
                window.location.href = 'dashboard.html';
            }
        } catch (error) {
            ErrorHandler.handleFirebaseError(error);
            window.location.href = 'login.html';
        }
    } else {
        console.log("No user logged in. Redirecting to login.");
        window.location.href = 'login.html';
    }
});

// --- UI ELEMENTS ---
const logoutButton = document.getElementById('logout-button');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const darkModeToggle = document.getElementById('dark-mode-toggle');

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

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        tabButtons.forEach(btn => btn.classList.remove('active', 'bg-primary/10', 'text-primary'));
        tabContents.forEach(content => content.classList.add('hidden'));
        button.classList.add('active', 'bg-primary/10', 'text-primary');
        document.getElementById(button.dataset.tab).classList.remove('hidden');
    });
});

// Dark Mode Toggle
if (localStorage.getItem('color-theme') === 'dark') {
    document.documentElement.classList.add('dark');
    darkModeToggle.checked = true;
} else {
    document.documentElement.classList.remove('dark')
    darkModeToggle.checked = false;
}

darkModeToggle.addEventListener('change', function() {
    if (localStorage.getItem('color-theme')) {
        if (localStorage.getItem('color-theme') === 'light') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('color-theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('color-theme', 'light');
        }
    } else {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('color-theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('color-theme', 'dark');
        }
    }
});

// --- BACKUP & RESTORE ---
const backupSystem = new BackupSystem();
const exportButton = document.getElementById('export-data-button');
const importInput = document.getElementById('import-data-input');

exportButton.addEventListener('click', () => {
    backupSystem.exportAllData();
});

importInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        if (confirm('Are you sure you want to import data? This will overwrite existing data and cannot be undone.')) {
            backupSystem.importData(file);
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    LazyLoader.init();
});
