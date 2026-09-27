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

    // 2. DOM Elements
    const cartItemsList = document.getElementById('cartItemsList');
    const totalPriceDisplay = document.getElementById('totalPriceDisplay');
    const clearCartBtn = document.getElementById('clearCartBtn');
    const checkoutBtn = document.getElementById('checkoutBtn');

    const isLight = document.documentElement.classList.contains('light-mode');
    const robuxImg = isLight ? 'img/robux-light.png' : 'img/robux-dark.png';

    function getCartKey() {
        return `cart_${currentUser.username}`;
    }

    function escapeHtml(str) {
        return String(str ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // 3. Render danh sách giỏ hàng
    function renderCart() {
        const cart = JSON.parse(localStorage.getItem(getCartKey())) || [];
        if (!cartItemsList) return;

        cartItemsList.innerHTML = '';

        if (cart.length === 0) {
            cartItemsList.innerHTML = '<p style="color: #8f949e; grid-column: 1/-1; text-align: center; padding: 40px;">Your cart is empty.</p>';
            if (totalPriceDisplay) totalPriceDisplay.textContent = '0';
            return;
        }

        let total = 0;

        cart.forEach((item, index) => {
            total += Number(item.price) || 0;

            const card = document.createElement('div');
            card.className = 'game-card';
            card.innerHTML = `
                <img src="${item.image || 'img/logo.png'}" alt="${escapeHtml(item.name)}" class="item-card-img" onerror="this.src='img/logo.png'">
                <h3>${escapeHtml(item.name)}</h3>
                <p class="item-price"><img src="${robuxImg}" alt="Robux" class="robux-icon" style="width: 16px; height: 16px; vertical-align: -2px; margin-right: 4px;" onerror="this.style.display='none'">${item.price}</p>
                <button class="btn-remove" style="background: #e74c3c; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; width: 100%; margin-top: 10px; font-weight: bold;">Remove</button>
            `;

            card.querySelector('.btn-remove').addEventListener('click', () => {
                removeFromCart(index);
            });

            cartItemsList.appendChild(card);
        });

        if (totalPriceDisplay) totalPriceDisplay.textContent = total;
    }

    function removeFromCart(index) {
        let cart = JSON.parse(localStorage.getItem(getCartKey())) || [];
        cart.splice(index, 1);
        localStorage.setItem(getCartKey(), JSON.stringify(cart));
        renderCart();
    }

    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            localStorage.removeItem(getCartKey());
            renderCart();
        });
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const cart = JSON.parse(localStorage.getItem(getCartKey())) || [];
            if (cart.length === 0) {
                alert('Your cart is empty!');
                return;
            }
            alert('Purchase successful!');
            localStorage.removeItem(getCartKey());
            renderCart();
        });
    }

    renderCart();
});