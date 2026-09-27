document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        window.location.href = 'home.html';
        return;
    }

    const registerForm = document.getElementById('registerForm');
    const usernameInput = document.getElementById('usernameInput');
    const passwordInput = document.getElementById('passwordInput');
    const confirmPasswordInput = document.getElementById('confirmPasswordInput');
    const errorMessage = document.getElementById('errorMessage');

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const username = usernameInput.value.trim();
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            if (!username || !password) {
                showError('Vui lòng điền đầy đủ thông tin!');
                return;
            }

            if (password !== confirmPassword) {
                showError('Mật khẩu xác nhận không khớp!');
                return;
            }

            const users = JSON.parse(localStorage.getItem('users')) || [];
            const isUserExists = users.some(u => u.username.toLowerCase() === username.toLowerCase());

            if (isUserExists) {
                showError('Tên tài khoản đã tồn tại!');
                return;
            }

            users.push({ username, password });
            localStorage.setItem('users', JSON.stringify(users));

            alert('Đăng ký thành công!');
            window.location.href = 'index.html';
        });
    }

    function showError(msg) {
        if (errorMessage) {
            errorMessage.textContent = msg;
            errorMessage.style.display = 'block';
        } else {
            alert(msg);
        }
    }
});