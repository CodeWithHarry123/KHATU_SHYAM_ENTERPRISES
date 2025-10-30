
import './firebase-init.js';
import './error-handler.js';
import './lazy-loader.js';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';

const auth = getAuth();
const db = getFirestore();

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    
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
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.classList.add('animate-slide-out');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

const logoutButton = document.getElementById('logout-button');
const mobileLogoutButton = document.getElementById('mobile-logout-button');
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
const displayName = document.getElementById('display-name');
const userPhone = document.getElementById('user-phone');
const userAvatarInitial = document.getElementById('user-avatar-initial');
const nameInput = document.getElementById('name-input');
const addressInput = document.getElementById('address-input');
const pincodeInput = document.getElementById('pincode-input');
const phoneNumberDisplay = document.getElementById('phone-number-display');
const memberSinceDisplay = document.getElementById('member-since-display');
const saveProfileButton = document.getElementById('save-profile-button');

onAuthStateChanged(auth, user => {
    if (user) {
        const userRef = doc(db, 'users', user.uid);
        getDoc(userRef).then(docSnap => {
            if (docSnap.exists()) {
                const userData = docSnap.data();
                displayName.textContent = userData.name || 'New User';
                userPhone.textContent = user.phoneNumber;
                phoneNumberDisplay.textContent = user.phoneNumber;
                nameInput.value = userData.name || '';
                addressInput.value = userData.address || '';
                pincodeInput.value = userData.pincode || '';
                if (userData.name) {
                    userAvatarInitial.textContent = userData.name.charAt(0).toUpperCase();
                } else {
                    userAvatarInitial.textContent = '?';
                }
                if (userData.createdAt) {
                    memberSinceDisplay.textContent = userData.createdAt.toDate().toLocaleDateString();
                }
            } else {
                // Should not happen for a logged in user, but handle it.
                window.location.href = 'login.html';
            }
        });

        // Input validation function
        function validateInput(input, type) {
            let sanitized = input.trim();
            if (type === 'name') {
                sanitized = sanitized.replace(/[^a-zA-Z\s]/g, '');
                if (sanitized.length < 2) {
                    return { valid: false, message: "Name must be at least 2 characters" };
                }
            }
            if (type === 'address') {
                sanitized = sanitized.replace(/<script>/gi, '');
                if (sanitized.length < 5) {
                    return { valid: false, message: "Address is too short" };
                }
            }
            if (type === 'pincode') {
                sanitized = sanitized.replace(/[^0-9]/g, '');
                if (sanitized.length !== 6) {
                    return { valid: false, message: "PIN code must be 6 digits" };
                }
            }
            return { valid: true, value: sanitized };
        }

        saveProfileButton.addEventListener('click', () => {
            // Validate Name
            const nameValidation = validateInput(nameInput.value, 'name');
            if (!nameValidation.valid) {
                showToast(nameValidation.message, 'error');
                return;
            }

            // Validate Address
            const addressValidation = validateInput(addressInput.value, 'address');
            if (!addressValidation.valid) {
                showToast(addressValidation.message, 'error');
                return;
            }

            // Validate Pincode
            const pincodeValidation = validateInput(pincodeInput.value, 'pincode');
            if (!pincodeValidation.valid) {
                showToast(pincodeValidation.message, 'error');
                return;
            }

            // All valid, get sanitized values
            const newName = nameValidation.value;
            const newAddress = addressValidation.value;
            const newPincode = pincodeValidation.value;

            updateDoc(userRef, {
                name: newName,
                address: newAddress,
                pincode: newPincode
            })
                .then(() => {
                    showToast('Profile updated successfully!', 'success');
                    displayName.textContent = newName;
                    userAvatarInitial.textContent = newName.charAt(0).toUpperCase();
                })
                .catch(error => {
                    console.error('Error updating profile: ', error);
                    showToast('Error updating profile.', 'error');
                });
        });

    } else {
        window.location.href = 'login.html';
    }
});

function handleLogout() {
    signOut(auth).then(() => { window.location.href = 'index.html'; });
}

logoutButton.addEventListener('click', handleLogout);
if(mobileLogoutButton) mobileLogoutButton.addEventListener('click', handleLogout);

mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

document.addEventListener('DOMContentLoaded', () => {
    LazyLoader.init();
});
