document.addEventListener('DOMContentLoaded', () => {
    // Nếu đã đăng nhập thì tự động vào home.html
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        window.location.href = 'home.html';
        return;
    }

    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('usernameInput');
    const passwordInput = document.getElementById('passwordInput');
    const errorMessage = document.getElementById('errorMessage');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const username = usernameInput.value.trim();
            const password = passwordInput.value;

            if (!username || !password) {
                showError('Vui lòng nhập đầy đủ thông tin!');
                return;
            }

            const users = JSON.parse(localStorage.getItem('users')) || [];
            const validUser = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);

            if (validUser) {
                localStorage.setItem('currentUser', JSON.stringify({ username: validUser.username }));
                window.location.href = 'home.html';
            } else {
                showError('Tài khoản hoặc mật khẩu không chính xác!');
            }
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