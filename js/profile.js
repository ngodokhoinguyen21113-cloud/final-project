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
    // 2. Xác định đang xem profile của ai (mặc định là chính mình)
    //    Truy cập qua profile.html?user=<tên_tài_khoản>
    // -------------------------------------------------------------
    const urlParams = new URLSearchParams(window.location.search);
    const profileUsername = urlParams.get('user') || currentUser.username;

    const profileAvatar = document.getElementById('profileAvatar');
    const profileName = document.getElementById('profileName');
    const profileMeta = document.getElementById('profileMeta');
    const profileNameInline = document.getElementById('profileNameInline');
    const profileItemsGrid = document.getElementById('profileItemsGrid');
    const ownerControls = document.getElementById('ownerControls');
    const toggleVerifiedBtn = document.getElementById('toggleVerifiedBtn');

    function getUsers() {
        return JSON.parse(localStorage.getItem('users')) || [];
    }
    function saveUsers(users) {
        localStorage.setItem('users', JSON.stringify(users));
    }
    function escapeHtml(str) {
        return String(str ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function createSimpleItemCard(item) {
        const card = document.createElement('div');
        const isLight = document.documentElement.classList.contains('light-mode');
        const robuxImg = isLight ? 'img/robux-light.png' : 'img/robux-dark.png';

        card.className = 'game-card';
        card.innerHTML = `
            <img src="${item.image || 'img/logo.png'}" alt="${escapeHtml(item.name)}" class="item-card-img" onerror="this.src='img/logo.png'">
            <h3>${escapeHtml(item.name)}</h3>
            <p class="item-desc">${escapeHtml(item.description)}</p>
            <p class="item-price"><img src="${robuxImg}" alt="Robux" style="width:16px; height:16px; vertical-align:-2px; margin-right:4px;" onerror="this.style.display='none'">${item.price}</p>
            <button class="btn-play">View Item</button>
        `;
        card.querySelector('.btn-play').addEventListener('click', () => {
            window.location.href = `viewItem.html?id=${item.id}`;
        });
        return card;
    }

    // -------------------------------------------------------------
    // 3. Render toàn bộ trang
    // -------------------------------------------------------------
    function render() {
        const record = getUserRecord(profileUsername);
        if (!record) {
            alert('Không tìm thấy người dùng này!');
            window.location.href = 'home.html';
            return;
        }

        if (profileAvatar) profileAvatar.src = getUserAvatar(profileUsername);

        if (profileName) {
            profileName.innerHTML = `${escapeHtml(profileUsername)} ${getUserBadgeHtml(profileUsername)}`;
        }
        if (profileNameInline) profileNameInline.textContent = profileUsername;

        const customItems = JSON.parse(localStorage.getItem('customItems')) || [];
        const userItems = customItems.filter(item => item.createdBy === profileUsername);
        if (profileMeta) profileMeta.textContent = `${userItems.length} item(s)`;

        // Nút cấp/thu hồi tick xanh — chỉ hiện cho owner, khi xem người khác
        // (không tự cấp cho chính mình, và không cấp/thu hồi huy hiệu của owner)
        const isViewerOwner = currentUser.username.toLowerCase() === OWNER_USERNAME.toLowerCase();
        const isViewingSelf = profileUsername.toLowerCase() === currentUser.username.toLowerCase();
        const isTargetOwner = profileUsername.toLowerCase() === OWNER_USERNAME.toLowerCase();

        if (ownerControls && toggleVerifiedBtn) {
            if (isViewerOwner && !isViewingSelf && !isTargetOwner) {
                ownerControls.style.display = 'block';
                toggleVerifiedBtn.textContent = record.verified ? 'Unverify user' : 'Verify user';
            } else {
                ownerControls.style.display = 'none';
            }
        }

        // Render sản phẩm của user này
        if (profileItemsGrid) {
            profileItemsGrid.innerHTML = '';
            if (userItems.length === 0) {
                profileItemsGrid.innerHTML = '<p style="color: #8f949e; grid-column: 1/-1; text-align: center; padding: 40px;">There is no item yet.</p>';
            } else {
                userItems.forEach(item => profileItemsGrid.appendChild(createSimpleItemCard(item)));
            }
        }
    }

    if (toggleVerifiedBtn) {
        toggleVerifiedBtn.addEventListener('click', () => {
            const users = getUsers();
            const updatedUsers = users.map(u =>
                u.username.toLowerCase() === profileUsername.toLowerCase()
                    ? { ...u, verified: !u.verified }
                    : u
            );
            saveUsers(updatedUsers);
            render();
        });
    }

    render();
});