
// This file uses the Firebase v8 compatibility library for the login page.
document.addEventListener('DOMContentLoaded', () => {
    const phoneNumberInput = document.getElementById('phone-number-input');
    const sendOtpButton = document.getElementById('send-otp-button');
    const verifyOtpButton = document.getElementById('verify-otp-button');
    const otpSection = document.getElementById('otp-section');
    const otpFieldset = document.getElementById('otp-fieldset');
    const otpInputs = otpFieldset.querySelectorAll('input');

    // 1. Setup reCAPTCHA
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
            console.log("reCAPTCHA solved");
        }
    });

    // 2. Send OTP Logic
    sendOtpButton.addEventListener('click', () => {
        const phoneNumber = "+91" + phoneNumberInput.value;
        const appVerifier = window.recaptchaVerifier;

        auth.signInWithPhoneNumber(phoneNumber, appVerifier)
            .then((confirmationResult) => {
                // SMS sent. Save confirmation result to use later.
                window.confirmationResult = confirmationResult;
                otpSection.classList.remove('hidden');
                sendOtpButton.parentElement.style.display = 'none'; // Hide the send OTP button area
                phoneNumberInput.disabled = true;
                otpInputs[0].focus();
                alert("OTP has been sent!");
            }).catch((error) => {
                console.error("Error sending OTP: ", error);
                recaptchaVerifier.render().then(widgetId => recaptchaVerifier.reset(widgetId));
                alert("Error sending OTP. Please try again.");
            });
    });

    // 3. Verify OTP Logic
    verifyOtpButton.addEventListener('click', () => {
        const verificationCode = Array.from(document.querySelectorAll('.otp-input')).map(input => input.value).join('');
        const errorMessage = document.getElementById('error-message');

        if (!verificationCode || verificationCode.length !== 6) {
            errorMessage.textContent = 'Please enter a valid 6-digit OTP.';
            return;
        }
        
        confirmationResult.confirm(verificationCode).then(async (result) => {
            const user = result.user;
            const phoneNumber = user.phoneNumber;
            
            try {
                // Pehle check karein ki user already exist karta hai ya nahi
                const userDoc = await db.collection('users').doc(user.uid).get();
                
                if (!userDoc.exists) {
                    // Naya user hai, to Firestore mein save karein
                    await db.collection('users').doc(user.uid).set({
                        phoneNumber: phoneNumber,
                        uid: user.uid,
                        khatu_website_admin: false, // Default admin status
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        name: phoneNumber, // Default name phone number hai
                        email: '', // Blank email
                        address: '' // Blank address
                    });
                    
                    console.log('New user added to Firestore database');
                } else {
                    console.log('User already exists in database');
                }
                
                // User role check karein aur redirect karein
                const userData = await db.collection('users').doc(user.uid).get();
                const isAdmin = userData.data().khatu_website_admin;
                
                if (isAdmin === true) {
                    window.location.href = 'admin_dashboard.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
                
            } catch (error) {
                console.error('Error saving user to database:', error);
                errorMessage.textContent = 'Login successful but error saving user data. Please contact support.';
            }
            
        }).catch((error) => {
            errorMessage.textContent = 'Invalid verification code. Please try again.';
            console.error('Verification error:', error);
        });
    });

    // 4. OTP Input Handling (replaces inline onkeydown/onkeyup)
    otpFieldset.addEventListener('keyup', (e) => {
        const target = e.target;
        const key = e.key;

        if (key.match(/^\d$/)) { // If a digit is entered
            if (target.value.length > 1) {
                // If user pastes multiple digits, fill subsequent inputs
                let currentValue = target.value;
                let currentInput = target;
                for (let i = 0; i < currentValue.length && currentInput; i++) {
                    currentInput.value = currentValue[i];
                    if (currentInput.nextElementSibling) {
                        currentInput = currentInput.nextElementSibling;
                    }
                }
                currentInput.focus();
            } else if (target.nextElementSibling) {
                target.nextElementSibling.focus();
            }
        }
    });

    otpFieldset.addEventListener('keydown', (e) => {
        const target = e.target;
        const key = e.key;

        if (key === 'Backspace' && target.value === '') {
            if (target.previousElementSibling) {
                target.previousElementSibling.value = '';
                target.previousElementSibling.focus();
            }
        } else if (key === 'ArrowLeft') {
            if (target.previousElementSibling) {
                target.previousElementSibling.focus();
            }
        } else if (key === 'ArrowRight') {
            if (target.nextElementSibling) {
                target.nextElementSibling.focus();
            }
        }
    });
});
