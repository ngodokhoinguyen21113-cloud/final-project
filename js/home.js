// ==========================================
// HÀM TOÀN CỤC: THÔNG BÁO NGUỜI MUA HÀNG
// ==========================================
function escapeHtmlNotif(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function loadBuyersNotification() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const notifList = document.getElementById('notifList');
    const notifBadge = document.getElementById('notifBadge');

    if (!currentUser || !notifList) return;

    // Lấy danh sách item do user hiện tại tạo
    const customItems = JSON.parse(localStorage.getItem('customItems')) || [];
    const myItemIds = customItems
        .filter(item => item.createdBy === currentUser.username)
        .map(item => item.id);

    if (myItemIds.length === 0) {
        notifList.innerHTML = '<div style="padding: 15px; text-align: center; color: #8f949e; font-size: 13px;">Bạn chưa tạo sản phẩm nào.</div>';
        if (notifBadge) notifBadge.style.display = 'none';
        return;
    }

    // Quét giỏ hàng của tất cả người dùng khác
    let buyersMap = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('cart_')) {
            const buyerUsername = key.replace('cart_', '');
            if (buyerUsername === currentUser.username) continue; // Bỏ qua nếu chính mình mua

            const cart = JSON.parse(localStorage.getItem(key)) || [];
            cart.forEach(item => {
                if (myItemIds.includes(item.id)) {
                    buyersMap.push({
                        buyer: buyerUsername,
                        itemName: item.name,
                        price: item.price
                    });
                }
            });
        }
    }

    if (buyersMap.length === 0) {
        notifList.innerHTML = '<div style="padding: 15px; text-align: center; color: #8f949e; font-size: 13px;">Chưa có ai mua/thêm sản phẩm của bạn.</div>';
        if (notifBadge) notifBadge.style.display = 'none';
    } else {
        if (notifBadge) {
            notifBadge.textContent = buyersMap.length;
            notifBadge.style.display = 'inline-block';
        }

        notifList.innerHTML = buyersMap.map(b => `
            <div style="padding: 12px; border-bottom: 1px solid #23272e; font-size: 13px; color: #cccccc; line-height: 1.4;">
                👤 <strong style="color: #ffffff;">${escapeHtmlNotif(b.buyer)}</strong> đã thêm <strong>"${escapeHtmlNotif(b.itemName)}"</strong> (${b.price} Robux) vào giỏ hàng!
            </div>
        `).join('');
    }
}

// Hàm bật/tắt dropdown gọi trực tiếp từ HTML
window.toggleNotifDropdown = function (event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    const notifDropdown = document.getElementById('notifDropdown');
    if (!notifDropdown) return;

    // Kiểm tra trạng thái hiển thị
    const isHidden = window.getComputedStyle(notifDropdown).display === 'none';
    notifDropdown.style.display = isHidden ? 'block' : 'none';

    if (isHidden && typeof loadBuyersNotification === 'function') {
        loadBuyersNotification(); // Tải danh sách khi mở
    }
};

// Đóng dropdown khi bấm ra ngoài vùng thông báo
document.addEventListener('click', (e) => {
    const notifDropdown = document.getElementById('notifDropdown');
    const notifBtn = document.getElementById('notifBtn');
    if (notifDropdown && notifBtn) {
        if (!notifDropdown.contains(e.target) && !notifBtn.contains(e.target)) {
            notifDropdown.style.display = 'none';
        }
    }
});


// ==========================================
// KHỞI TẠO CHỨC NĂNG TRANG CHỦ
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. KIỂM TRA ĐĂNG NHẬP & USER INFO
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

    // Cập nhật đếm thông báo ban đầu
    loadBuyersNotification();

    // Sự kiện nút Chuông
    const notifBtn = document.getElementById('notifBtn');
    if (notifBtn) {
        notifBtn.addEventListener('click', (e) => window.toggleNotifDropdown(e));
    }

    // 2. XỬ LÝ MENU 3 GẠCH (HAMBURGER)
    const hamburgerBtn = document.getElementById('hamburgerBtn') || document.getElementById('navMenuBtn');
    const navDropdown = document.getElementById('navDropdown');

    if (hamburgerBtn && navDropdown) {
        hamburgerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navDropdown.classList.toggle('open');
        });

        document.addEventListener('click', (e) => {
            if (!navDropdown.contains(e.target) && e.target !== hamburgerBtn) {
                navDropdown.classList.remove('open');
            }
        });
    }

    // 3. DOM ELEMENTS & CHUẨN BỊ DỮ LIỆU
    const itemsGrid = document.getElementById('itemsGrid');
    const recentGrid = document.getElementById('recentGrid');
    const recentSection = document.getElementById('recentSection');
    const gridTitle = document.getElementById('gridTitle');
    const searchInput = document.getElementById('searchInput');
    const profileResultsSection = document.getElementById('profileResultsSection');
    const profileResultsGrid = document.getElementById('profileResultsGrid');

    const isLight = document.documentElement.classList.contains('light-mode');
    const robuxImg = isLight ? 'img/robux-light.png' : 'img/robux-dark.png';

    let allItems = [];

    function escapeHtml(str) {
        return String(str ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // 4. HÀM TẠO CARD SẢN PHẨM
    function createItemCard(item) {
        const card = document.createElement('div');
        card.className = 'game-card';

        const favActive = typeof isFavorited === 'function' && isFavorited(currentUser.username, item.id);

        card.innerHTML = `
            <button class="btn-favorite ${favActive ? 'active' : ''}" title="Yêu thích">${favActive ? '♥' : '♡'}</button>
            <img src="${item.image || 'img/logo.png'}" alt="${escapeHtml(item.name)}" class="item-card-img" onerror="this.src='img/logo.png'">
            <h3>${escapeHtml(item.name)}</h3>
            <p class="item-desc">${escapeHtml(item.description)}</p>
            <p class="item-price"><img src="${robuxImg}" alt="Robux" class="robux-icon" style="width: 16px; height: 16px; vertical-align: -2px; margin-right: 4px;" onerror="this.style.display='none'">${item.price}</p>
            <p class="item-creator">Created by: <span>${escapeHtml(item.createdBy || 'Unknown')}</span></p>
            <div style="display: flex; gap: 8px; margin-top: 10px;">
                <button class="btn-play" style="flex: 1;">View Item</button>
                <button class="btn-add-cart" style="flex: 1; background: #2ecc71; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">+ Cart</button>
            </div>
        `;

        // Nút Yêu thích
        const favBtn = card.querySelector('.btn-favorite');
        if (favBtn && typeof toggleFavorite === 'function') {
            favBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const nowActive = toggleFavorite(currentUser.username, item);
                favBtn.classList.toggle('active', nowActive);
                favBtn.textContent = nowActive ? '♥' : '♡';
            });
        }

        // Nút Xem chi tiết
        const viewBtn = card.querySelector('.btn-play');
        viewBtn.addEventListener('click', () => {
            saveToRecent(item);
            if (item.assetId) {
                window.location.href = `viewItem.html?assetId=${item.assetId}`;
            } else {
                window.location.href = `viewItem.html?id=${item.id}`;
            }
        });

        // Nút Thêm vào giỏ hàng
        const cartBtn = card.querySelector('.btn-add-cart');
        cartBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const cartKey = `cart_${currentUser.username}`;
            let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
            cart.push(item);
            localStorage.setItem(cartKey, JSON.stringify(cart));
            alert(`Đã thêm "${item.name}" vào giỏ hàng!`);
            loadBuyersNotification();
        });

        return card;
    }

    // 5. KẾT QUẢ TÌM KIẾM PROFILE
    function createProfileCard(username) {
        const card = document.createElement('div');
        card.className = 'profile-result-card';

        const avatarSrc = typeof getUserAvatar === 'function' ? getUserAvatar(username) : 'img/default-avartar.png';
        const badgeHtml = typeof getUserBadgeHtml === 'function' ? getUserBadgeHtml(username) : '';

        card.innerHTML = `
            <img src="${avatarSrc}" alt="${escapeHtml(username)}" class="profile-result-avatar" onerror="this.src='img/default-avartar.png'">
            <span class="profile-result-name">${escapeHtml(username)} ${badgeHtml}</span>
        `;
        card.addEventListener('click', () => {
            window.location.href = `profile.html?user=${encodeURIComponent(username)}`;
        });
        return card;
    }

    function renderProfileResults(query) {
        if (!profileResultsSection || !profileResultsGrid) return;

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const matches = users.filter(u => u.username.toLowerCase().includes(query));

        if (matches.length === 0) {
            profileResultsSection.style.display = 'none';
            return;
        }

        profileResultsGrid.innerHTML = '';
        matches.forEach(u => profileResultsGrid.appendChild(createProfileCard(u.username)));
        profileResultsSection.style.display = 'block';
    }

    // 6. QUẢN LÝ RECENT ITEMS
    function saveToRecent(item) {
        let recents = JSON.parse(localStorage.getItem('recentItems')) || [];
        recents = recents.filter(r => (r.id && r.id !== item.id) || (r.assetId && r.assetId !== item.assetId));
        recents.unshift(item);
        if (recents.length > 4) recents.pop();
        localStorage.setItem('recentItems', JSON.stringify(recents));
    }

    function renderRecentItems() {
        const recents = JSON.parse(localStorage.getItem('recentItems')) || [];
        if (!recentSection || !recentGrid) return;

        if (recents.length === 0) {
            recentSection.style.display = 'none';
        } else {
            recentSection.style.display = 'block';
            recentGrid.innerHTML = '';
            recents.forEach(item => recentGrid.appendChild(createItemCard(item)));
        }
    }

    // 7. RENDER DANH SÁCH MAIN GRID
    function renderMainGrid(items) {
        if (!itemsGrid) return;
        itemsGrid.innerHTML = '';

        if (items.length === 0) {
            itemsGrid.innerHTML = '<p style="color: #8f949e; grid-column: 1/-1; text-align: center; padding: 40px;">No items found.</p>';
            return;
        }

        items.forEach(item => itemsGrid.appendChild(createItemCard(item)));
    }

    async function loadAndRenderAllItems() {
        if (!itemsGrid) return;

        const customItems = JSON.parse(localStorage.getItem('customItems')) || [];
        allItems = [...customItems];

        renderRecentItems();
        renderMainGrid(allItems);

        try {
            if (typeof fetchSketchfabModels === 'function') {
                const sketchfabItems = await fetchSketchfabModels('game item', 12);
                if (sketchfabItems.length > 0) {
                    allItems = [...customItems, ...sketchfabItems];
                }
            }
        } catch (error) {
            console.warn('Không thể tải model từ Sketchfab:', error);
        }

        if (!searchInput || searchInput.value.trim() === '') {
            renderMainGrid(allItems);
        }
    }

    // 8. TÌM KIẾM
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();

            if (query === '') {
                if (gridTitle) gridTitle.textContent = '🔥 Recommended Items';
                if (profileResultsSection) profileResultsSection.style.display = 'none';
                renderRecentItems();
                renderMainGrid(allItems);
            } else {
                if (gridTitle) gridTitle.textContent = '📦 Products Found';
                if (recentSection) recentSection.style.display = 'none';

                renderProfileResults(query);

                const filtered = allItems.filter(item => {
                    const nameMatch = item.name ? item.name.toLowerCase().includes(query) : false;
                    const creatorMatch = item.createdBy ? item.createdBy.toLowerCase().includes(query) : false;
                    return nameMatch || creatorMatch;
                });
                renderMainGrid(filtered);
            }
        });
    }

    // Chạy ứng dụng
    loadAndRenderAllItems();
});