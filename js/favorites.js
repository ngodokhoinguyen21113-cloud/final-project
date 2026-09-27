document.addEventListener('DOMContentLoaded', () => {
    // 1. Kiểm tra đăng nhập
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

    const favoritesGrid = document.getElementById('favoritesGrid');
    const isLight = document.documentElement.classList.contains('light-mode');
    const robuxImg = isLight ? 'img/robux-light.png' : 'img/robux-dark.png';

    function escapeHtml(str) {
        return String(str ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function render() {
        if (!favoritesGrid) return;
        const favorites = getFavorites(currentUser.username);
        favoritesGrid.innerHTML = '';

        if (favorites.length === 0) {
            favoritesGrid.innerHTML = '<p style="color: #8f949e; grid-column: 1/-1; text-align: center; padding: 40px;">Bạn chưa yêu thích sản phẩm nào.</p>';
            return;
        }

        favorites.forEach(item => {
            const card = document.createElement('div');
            card.className = 'game-card';
            card.innerHTML = `
                <button class="btn-favorite active" title="Bỏ yêu thích">♥</button>
                <img src="${item.image || 'img/logo.png'}" alt="${escapeHtml(item.name)}" class="item-card-img" onerror="this.src='img/logo.png'">
                <h3>${escapeHtml(item.name)}</h3>
                <p class="item-desc">${escapeHtml(item.description)}</p>
                <p class="item-price"><img src="${robuxImg}" alt="Robux" style="width: 16px; height: 16px; vertical-align: -2px; margin-right: 4px;" onerror="this.style.display='none'">${item.price}</p>
                <p class="item-creator">Created by: <span>${escapeHtml(item.createdBy || 'Unknown')}</span></p>
                <button class="btn-play">View Item</button>
            `;

            card.querySelector('.btn-favorite').addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFavorite(currentUser.username, item);
                render();
            });

            card.querySelector('.btn-play').addEventListener('click', () => {
                if (item.assetId) {
                    window.location.href = `viewItem.html?assetId=${item.assetId}`;
                } else {
                    window.location.href = `viewItem.html?id=${item.id}`;
                }
            });

            favoritesGrid.appendChild(card);
        });
    }

    render();
});