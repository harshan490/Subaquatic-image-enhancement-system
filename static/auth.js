// ============ AUTHENTICATION HANDLERS ============

// Toggle Password Visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
}

// ============ LOGIN HANDLER ============
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorEl = document.getElementById('loginError');

        // Clear error
        errorEl.textContent = '';
        errorEl.classList.remove('show');

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            const data = await response.json();

            if (data.success) {
                // Login successful
                showSuccess('Login successful! Redirecting...');
                setTimeout(() => {
                    window.location.href = '/enhance_page';
                }, 1000);
            } else {
                // Show error
                errorEl.textContent = data.message || 'Invalid username or password';
                errorEl.classList.add('show');
                shakeElement(loginForm);
            }
        } catch (error) {
            errorEl.textContent = 'An error occurred. Please try again.';
            errorEl.classList.add('show');
            console.error('Login error:', error);
        }
    });
}

// ============ SIGNUP HANDLER ============
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('signup-username').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm').value;
        const errorEl = document.getElementById('signupError');

        // Clear error
        errorEl.textContent = '';
        errorEl.classList.remove('show');

        // Client-side validation
        if (!username || !email || !password || !confirmPassword) {
            errorEl.textContent = 'All fields are required';
            errorEl.classList.add('show');
            shakeElement(signupForm);
            return;
        }

        if (password.length < 6) {
            errorEl.textContent = 'Password must be at least 6 characters';
            errorEl.classList.add('show');
            shakeElement(signupForm);
            return;
        }

        if (password !== confirmPassword) {
            errorEl.textContent = 'Passwords do not match';
            errorEl.classList.add('show');
            shakeElement(signupForm);
            return;
        }

        try {
            const response = await fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password,
                    confirm_password: confirmPassword
                })
            });

            const data = await response.json();

            if (data.success) {
                // Signup successful
                showSuccess('Account created successfully! Redirecting...');
                setTimeout(() => {
                    window.location.href = '/enhance_page';
                }, 1000);
            } else {
                // Show error
                errorEl.textContent = data.message || 'An error occurred';
                errorEl.classList.add('show');
                shakeElement(signupForm);
            }
        } catch (error) {
            errorEl.textContent = 'An error occurred. Please try again.';
            errorEl.classList.add('show');
            console.error('Signup error:', error);
        }
    });
}

// ============ UTILITY FUNCTIONS ============
function shakeElement(element) {
    element.style.animation = 'none';
    setTimeout(() => {
        element.style.animation = 'shake 0.5s ease';
    }, 10);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #34C759, #2ED573);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        font-weight: 600;
        z-index: 1000;
        box-shadow: 0 8px 24px rgba(52, 199, 89, 0.4);
        animation: slideInRight 0.4s ease;
    `;
    successDiv.textContent = message;
    document.body.appendChild(successDiv);

    setTimeout(() => {
        successDiv.style.animation = 'slideOutRight 0.4s ease';
        setTimeout(() => {
            successDiv.remove();
        }, 400);
    }, 2000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }

    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);
