document.addEventListener('DOMContentLoaded', () => {
    // 1. Xử lý Đăng ký (Register)
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const username = document.getElementById('regUsername').value.trim();
            const password = document.getElementById('regPassword').value.trim();
            const confirmPassword = document.getElementById('regConfirmPassword').value.trim();

            if (!username || !password || !confirmPassword) {
                alert('Please fill in all fields!');
                return;
            }

            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }

            // Lấy danh sách tài khoản từ localStorage
            const users = JSON.parse(localStorage.getItem('users')) || [];

            // Kiểm tra trùng username
            const userExists = users.some(u => u.username === username);
            if (userExists) {
                alert('Username is already registered!');
                return;
            }

            // Lưu tài khoản mới
            const newUser = { username, password };
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));

            // Tự động đăng nhập người dùng vừa đăng ký
            localStorage.setItem('currentUser', JSON.stringify(newUser));

            alert('Registration successful! Redirecting to home...');
            window.location.href = 'home.html';
        });
    }

    // 2. Xử lý Đăng nhập (Login)
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const username = document.getElementById('loginUsername').value.trim();
            const password = document.getElementById('loginPassword').value.trim();

            if (!username || !password) {
                alert('Please fill in all fields!');
                return;
            }

            const users = JSON.parse(localStorage.getItem('users')) || [];

            // Tìm tài khoản trùng khớp username và password
            const foundUser = users.find(u => u.username === username && u.password === password);

            if (foundUser) {
                // Lưu thông tin phiên đăng nhập
                localStorage.setItem('currentUser', JSON.stringify(foundUser));
                alert(`Welcome back, ${foundUser.username}! Redirecting to home...`);
                window.location.href = 'home.html';
            } else {
                alert('Invalid username or password!');
            }
        });
    }
});