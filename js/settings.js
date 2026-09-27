document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // 1. Kiểm tra đăng nhập
    // -------------------------------------------------------------
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    const displayUsername = document.getElementById('displayUsername');
    if (displayUsername) displayUsername.textContent = currentUser.username;

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }

    // -------------------------------------------------------------
    // 2. Helper thao tác với danh sách users trong LocalStorage
    // -------------------------------------------------------------
    function getUsers() {
        return JSON.parse(localStorage.getItem('users')) || [];
    }
    function saveUsers(users) {
        localStorage.setItem('users', JSON.stringify(users));
    }
    function findUserRecord(username) {
        return getUsers().find(u => u.username.toLowerCase() === username.toLowerCase());
    }
    function showMessage(el, text, isError) {
        if (!el) return;
        el.textContent = text;
        el.style.color = isError ? '#ff4d4d' : '#3ddc84';
    }
    function convertFileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // -------------------------------------------------------------
    // 3. Hồ sơ: Avatar & Tên hiển thị
    // -------------------------------------------------------------
    const avatarPreview = document.getElementById('avatarPreview');
    const avatarFileInput = document.getElementById('avatarFileInput');
    const nameInput = document.getElementById('nameInput');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const profileMessage = document.getElementById('profileMessage');

    let pendingAvatarBase64 = null;

    const userRecord = findUserRecord(currentUser.username);
    if (nameInput) nameInput.value = currentUser.username;
    if (avatarPreview && userRecord && userRecord.avatar) {
        avatarPreview.src = userRecord.avatar;
    }

    if (avatarFileInput) {
        avatarFileInput.addEventListener('change', async (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            pendingAvatarBase64 = await convertFileToBase64(file);
            if (avatarPreview) avatarPreview.src = pendingAvatarBase64;
        });
    }

    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', () => {
            const newName = nameInput.value.trim();
            if (!newName) {
                showMessage(profileMessage, 'Tên hiển thị không được để trống!', true);
                return;
            }

            const users = getUsers();
            const oldUsername = currentUser.username;
            const isNameChanged = newName.toLowerCase() !== oldUsername.toLowerCase();

            if (isNameChanged) {
                const nameTaken = users.some(u => u.username.toLowerCase() === newName.toLowerCase());
                if (nameTaken) {
                    showMessage(profileMessage, 'Tên này đã được sử dụng, vui lòng chọn tên khác!', true);
                    return;
                }
            }

            const updatedUsers = users.map(u => {
                if (u.username.toLowerCase() === oldUsername.toLowerCase()) {
                    return {
                        ...u,
                        username: newName,
                        avatar: pendingAvatarBase64 || u.avatar
                    };
                }
                return u;
            });
            saveUsers(updatedUsers);

            // Nếu đổi tên, cập nhật lại "Created by" của các item đã tạo trước đó
            if (isNameChanged) {
                const customItems = JSON.parse(localStorage.getItem('customItems')) || [];
                const updatedItems = customItems.map(item =>
                    item.createdBy === oldUsername ? { ...item, createdBy: newName } : item
                );
                localStorage.setItem('customItems', JSON.stringify(updatedItems));
            }

            localStorage.setItem('currentUser', JSON.stringify({ username: newName }));
            if (displayUsername) displayUsername.textContent = newName;
            currentUser.username = newName;

            showMessage(profileMessage, 'Đã lưu thay đổi hồ sơ!', false);
        });
    }

    // -------------------------------------------------------------
    // 4. Dark / Light Mode
    // -------------------------------------------------------------
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const savedTheme = localStorage.getItem('themeMode') || 'dark';
        themeToggle.checked = savedTheme === 'light';

        themeToggle.addEventListener('change', () => {
            const mode = themeToggle.checked ? 'light' : 'dark';
            if (window.setThemeMode) {
                window.setThemeMode(mode);
            }
        });
    }

    // -------------------------------------------------------------
    // 5. Đổi mật khẩu
    // -------------------------------------------------------------
    const passwordForm = document.getElementById('passwordForm');
    const passwordMessage = document.getElementById('passwordMessage');

    if (passwordForm) {
        passwordForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const currentPassword = document.getElementById('currentPasswordInput').value;
            const newPassword = document.getElementById('newPasswordInput').value;
            const confirmPassword = document.getElementById('confirmPasswordInput').value;

            const users = getUsers();
            const record = users.find(u => u.username.toLowerCase() === currentUser.username.toLowerCase());

            if (!record || record.password !== currentPassword) {
                showMessage(passwordMessage, 'Mật khẩu hiện tại không đúng!', true);
                return;
            }

            if (!newPassword || newPassword !== confirmPassword) {
                showMessage(passwordMessage, 'Mật khẩu mới xác nhận không khớp!', true);
                return;
            }

            const updatedUsers = users.map(u =>
                u.username.toLowerCase() === currentUser.username.toLowerCase()
                    ? { ...u, password: newPassword }
                    : u
            );
            saveUsers(updatedUsers);

            passwordForm.reset();
            showMessage(passwordMessage, 'Đổi mật khẩu thành công!', false);
        });
    }
});