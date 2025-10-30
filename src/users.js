
import './firebase-init.js';
import './error-handler.js';
import './lazy-loader.js';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';

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
                    loadAllUsers();
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
const usersTableBody = document.getElementById('users-table-body');
const usersCardView = document.getElementById('users-card-view');
const logoutButton = document.getElementById('logout-button');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
const searchInput = document.getElementById('search-input');
const addUserButton = document.getElementById('add-user-button');
const userModal = document.getElementById('user-modal');
const modalContent = document.getElementById('modal-content');
const modalTitle = document.getElementById('modal-title');
const modalCloseButton = document.getElementById('modal-close-button');
const modalCancelButton = document.getElementById('modal-cancel-button');
const userForm = document.getElementById('user-form');
const userIdInput = document.getElementById('user-id');
const userNameInput = document.getElementById('user-name');
const userPhoneInput = document.getElementById('user-phone');
const userRoleInput = document.getElementById('user-role');

let allUsersData = [];

// --- EVENT LISTENERS ---
sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('-translate-x-full'));
logoutButton.addEventListener('click', (e) => {
    e.preventDefault();
    signOut(auth).then(() => window.location.href = 'index.html');
});
searchInput.addEventListener('input', (e) => renderUsers(allUsersData, e.target.value));
addUserButton.addEventListener('click', openUserModal);
modalCloseButton.addEventListener('click', closeUserModal);
modalCancelButton.addEventListener('click', closeUserModal);
userModal.addEventListener('click', (e) => {
    if (e.target === userModal) closeUserModal();
});
userForm.addEventListener('submit', saveUser);

document.body.addEventListener('click', function(event) {
    const editButton = event.target.closest('.edit-user-button');
    if (editButton) {
        const userId = editButton.dataset.userId;
        openUserModal(userId);
    }
});

// Dark Mode Check
if (localStorage.getItem('color-theme') === 'dark') {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark');
}

// --- MODAL FUNCTIONS ---
function openUserModal(userId = null) {
    userForm.reset();
    if (userId) {
        const user = allUsersData.find(u => u.id === userId);
        if (user) {
            modalTitle.textContent = 'Edit User';
            userIdInput.value = user.id;
            userNameInput.value = user.name || '';
            userPhoneInput.value = user.phoneNumber || '';
            userRoleInput.value = user.khatu_website_admin ? 'admin' : 'user';
        }
    } else {
        modalTitle.textContent = 'Add User';
        userIdInput.value = '';
    }
    userModal.classList.remove('hidden');
    userModal.classList.add('flex');
    setTimeout(() => modalContent.classList.remove('scale-95'), 50);
}

function closeUserModal() {
    modalContent.classList.add('scale-95');
    setTimeout(() => {
        userModal.classList.add('hidden');
        userModal.classList.remove('flex');
    }, 300);
}

function saveUser(e) {
    e.preventDefault();
    const id = userIdInput.value;
    const userData = {
        name: userNameInput.value,
        phoneNumber: userPhoneInput.value,
        khatu_website_admin: userRoleInput.value === 'admin',
        createdAt: serverTimestamp() // This will be ignored on update
    };

    let promise;
    if (id) {
        // Update existing user
        delete userData.createdAt; // Don't update createdAt
        promise = updateDoc(doc(db, 'users', id), userData);
    } else {
        // Add new user - Note: This doesn't create an auth user, just a DB entry.
        promise = addDoc(collection(db, 'users'), userData);
    }

    promise.then(() => {
        closeUserModal();
        loadAllUsers(); // Refresh the list
    }).catch(error => console.error("Error saving user: ", error));
}

// --- DATA LOADING & RENDERING ---
function loadAllUsers() {
    getDocs(collection(db, 'users'))
        .then((querySnapshot) => {
            allUsersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderUsers(allUsersData);
        })
        .catch((error) => {
            console.error("Error getting users: ", error);
            usersTableBody.innerHTML = `<tr><td colspan="5" class="text-center py-10 text-red-500">Error loading users.</td></tr>`;
            usersCardView.innerHTML = `<p class="text-center py-10 text-red-500 col-span-full">Error loading users.</p>`;
        });
}

function renderUsers(users, filter = '') {
    const filteredUsers = users.filter(user => {
        const searchTerm = filter.toLowerCase();
        const name = (user.name || '').toLowerCase();
        const phone = (user.phoneNumber || '').toLowerCase();
        return name.includes(searchTerm) || phone.includes(searchTerm);
    });

    usersTableBody.innerHTML = '';
    usersCardView.innerHTML = '';

    if (filteredUsers.length === 0) {
        const noDataHtml = `<p class="text-center py-10 col-span-full">No users found.</p>`;
        usersTableBody.innerHTML = `<tr><td colspan="5">${noDataHtml}</td></tr>`;
        usersCardView.innerHTML = noDataHtml;
        return;
    }

    filteredUsers.forEach((user) => {
        const registrationDate = user.createdAt ? user.createdAt.toDate().toLocaleDateString() : 'N/A';
        const isAdmin = user.khatu_website_admin === true;
        const userInitial = (user.name || '?').charAt(0).toUpperCase();

        // --- Create Desktop Table Row ---
        const tableRow = `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-4">
                        <div class="flex-shrink-0 h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">${userInitial}</div>
                        <div>
                            <div class="text-base font-medium text-text-light dark:text-white">${user.name || 'N/A'}</div>
                            <div class="text-sm text-gray-500 dark:text-gray-400">${user.phoneNumber}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-base text-gray-600 dark:text-gray-400">${registrationDate}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    ${isAdmin ? '<span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary/20 text-primary">Admin</span>' : '<span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-200 text-gray-800">User</span>'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="edit-user-button text-primary hover:text-primary/80" data-user-id="${user.id}">Edit</button>
                </td>
            </tr>`;
        usersTableBody.innerHTML += tableRow;

        // --- Create Mobile Card ---
        const card = `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-3">
                <div class="flex justify-between items-start">
                    <div class="flex items-center gap-3">
                        <div class="flex-shrink-0 h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">${userInitial}</div>
                        <div>
                            <p class="font-bold text-primary dark:text-secondary">${user.name || 'N/A'}</p>
                            <p class="text-sm text-gray-500 dark:text-gray-400">${user.phoneNumber}</p>
                        </div>
                    </div>
                    ${isAdmin ? '<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">Admin</span>' : '<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800">User</span>'}
                </div>
                <div class="text-sm flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                    <p class="text-gray-500 dark:text-gray-400">Registered: ${registrationDate}</p>
                    <button class="edit-user-button text-primary hover:text-primary/80 font-medium" data-user-id="${user.id}">Edit</button>
                </div>
            </div>`;
        usersCardView.innerHTML += card;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    LazyLoader.init();
});
