document.addEventListener('DOMContentLoaded', () => {
    // 1. Kiểm tra đăng nhập
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    const displayUsername = document.getElementById('displayUsername');
    if (displayUsername) {
        displayUsername.textContent = currentUser.username;
    }

    // 2. Xử lý nút Log Out
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }

    const myItemsGrid = document.getElementById('myItemsGrid');
    const editModal = document.getElementById('editModal');
    const editItemForm = document.getElementById('editItemForm');
    const closeModalBtn = document.getElementById('closeModalBtn');

    // Các ô Input trong Modal
    const editItemId = document.getElementById('editItemId');
    const editItemName = document.getElementById('editItemName');
    const editItemPrice = document.getElementById('editItemPrice');
    const editItemDesc = document.getElementById('editItemDesc');
    const editItemImage = document.getElementById('editItemImage');

    // 3. Render danh sách sản phẩm cá nhân
    function renderMyItems() {
        if (!myItemsGrid) return;
        myItemsGrid.innerHTML = '';

        const customItems = JSON.parse(localStorage.getItem('customItems')) || [];
        const userItems = customItems.filter(item => item.createdBy === currentUser.username);

        if (userItems.length === 0) {
            myItemsGrid.innerHTML = '<p style="color: #8f949e; grid-column: 1/-1; text-align: center; padding: 40px;">You haven\'t created any items yet.</p>';
            return;
        }

        userItems.forEach(item => {
            const card = document.createElement('div');
            const isLight = document.documentElement.classList.contains('light-mode');
            const robuxImg = isLight ? 'img/robux-light.png' : 'img/robux-dark.png'

            card.className = 'game-card';
            card.innerHTML = `
                <img src="${item.image || 'img/logo.png'}" alt="${item.name}" class="item-card-img" onerror="this.src='img/logo.png'">
                <h3>${item.name}</h3>
                <p class="item-desc">${item.description}</p>
                <p class="item-price"><img src="${robuxImg}" alt="Robux" style="width: 16px; height: 16px; vertical-align: -2px; margin-right: 4px;">${item.price}</p>
                <div style="display: flex; gap: 8px; margin-top: 10px;">
                    <button class="btn-play btn-edit-item" style="background: #00a2ff; flex: 1;">Edit</button>
                    <button class="btn-play btn-delete-item" style="background: #ff4d4d; flex: 1;">Delete</button>
                </div>
            `;

            // Bấm nút Edit
            const editBtn = card.querySelector('.btn-edit-item');
            editBtn.addEventListener('click', () => {
                openEditModal(item);
            });

            // Bấm nút Delete
            const deleteBtn = card.querySelector('.btn-delete-item');
            deleteBtn.addEventListener('click', () => {
                if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
                    deleteItem(item.id);
                }
            });

            myItemsGrid.appendChild(card);
        });
    }

    // Trong hàm openEditModal(item):
    function openEditModal(item) {
        editItemId.value = item.id;
        editItemName.value = item.name;
        editItemPrice.value = item.price;
        editItemDesc.value = item.description;
        editItemImage.value = item.image || '';

        // Đảm bảo dùng 'flex' để ăn khớp với flexbox của modal-overlay
        editModal.style.display = 'flex';
    }

    // Đóng Modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            editModal.style.display = 'none';
        });
    }

    // 4. Lưu thay đổi sau khi Edit
    if (editItemForm) {
        editItemForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = Number(editItemId.value);
            let customItems = JSON.parse(localStorage.getItem('customItems')) || [];

            customItems = customItems.map(item => {
                if (item.id === id) {
                    return {
                        ...item,
                        name: editItemName.value.trim(),
                        price: parseFloat(editItemPrice.value) || 0,
                        description: editItemDesc.value.trim(),
                        image: editItemImage.value.trim() || 'img/logo.png'
                    };
                }
                return item;
            });

            localStorage.setItem('customItems', JSON.stringify(customItems));
            editModal.style.display = 'none';
            alert('Item updated successfully!');
            renderMyItems();
        });
    }

    // 5. Xóa item
    function deleteItem(itemId) {
        let customItems = JSON.parse(localStorage.getItem('customItems')) || [];
        customItems = customItems.filter(item => item.id !== itemId);
        localStorage.setItem('customItems', JSON.stringify(customItems));
        renderMyItems();
    }

    renderMyItems();
});