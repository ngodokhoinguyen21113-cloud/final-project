// nav.js — xử lý mở/đóng menu dạng hamburger (☰) và nạp avatar người dùng
// lên navbar. Dùng chung cho mọi trang có nhúng file này.
document.addEventListener('DOMContentLoaded', () => {
    // 1. Nạp avatar người dùng hiện tại (nếu chưa có thì dùng ảnh mặc định)
    const navAvatar = document.getElementById('navAvatar');
    if (navAvatar) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const record = users.find(u => u.username.toLowerCase() === currentUser.username.toLowerCase());
            navAvatar.src = (record && record.avatar) ? record.avatar : 'img/default-avartar.png';
        }
    }

    // 2. Menu dạng hamburger (☰)
    const menuBtn = document.getElementById('navMenuBtn');
    const dropdown = document.getElementById('navDropdown');
    if (!menuBtn || !dropdown) return;

    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('open');
    });

    // Bấm ra ngoài thì tự đóng menu
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && e.target !== menuBtn) {
            dropdown.classList.remove('open');
        }
    });

    // Đóng menu sau khi bấm chọn 1 mục trong đó
    dropdown.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => dropdown.classList.remove('open'));
    });
});