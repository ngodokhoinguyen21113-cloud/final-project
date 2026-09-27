document.addEventListener('DOMContentLoaded', async () => {
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

    // 2. Nút Log Out
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }

    // Đổi ảnh chính khi chọn thumbnail
    function changeMainImage(imgUrl, activeElement) {
        const detailImg = document.getElementById('detailImg');
        if (detailImg) detailImg.src = imgUrl;

        document.querySelectorAll('.thumb-item').forEach(el => el.classList.remove('active'));
        if (activeElement) activeElement.classList.add('active');
    }

    // 3. Đọc id hoặc assetId từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const customId = urlParams.get('id');
    const assetId = urlParams.get('assetId');

    let item = null;

    // Trường hợp 1: Item tự thêm (Tìm theo ID trong localStorage)
    if (customId) {
        const customItems = JSON.parse(localStorage.getItem('customItems')) || [];
        item = customItems.find(i => String(i.id) === String(customId));
    }

    // Trường hợp 2: Item lấy từ Sketchfab (nếu mở trực tiếp qua assetId)
    if (!item && assetId) {
        item = {
            assetId: assetId,
            name: 'Đang tải...',
            price: 0,
            description: '',
            createdBy: 'Sketchfab Creator'
        };
    }

    // Render thông tin nếu tìm thấy item
    if (item) {
        // Tải thông tin chi tiết từ Sketchfab nếu cần
        if (!customId && item.assetId && typeof fetchSketchfabModelDetails === 'function') {
            try {
                const details = await fetchSketchfabModelDetails(item.assetId);
                item = { ...item, ...details };
            } catch (err) {
                console.warn('Không thể tải chi tiết model Sketchfab:', err);
                item.name = item.name === 'Đang tải...' ? 'Sketchfab Model' : item.name;
            }
        }

        // Render tên, mô tả, người tạo
        const detailName = document.getElementById('detailName');
        if (detailName) detailName.textContent = item.name || 'Unknown Item';

        const detailDescEl = document.getElementById('detailDesc');
        if (detailDescEl) {
            detailDescEl.textContent = item.description || 'No description available.';
            detailDescEl.style.wordBreak = 'break-word';
            detailDescEl.style.overflowWrap = 'anywhere';
        }

        const detailCreator = document.getElementById('detailCreator');
        if (detailCreator) detailCreator.innerHTML = `Created by: <span>${item.createdBy || 'Unknown'}</span>`;

        // Render Giá tiền vào nút Buy Now gộp
        const buyItemPrice = document.getElementById('buyItemPrice');
        if (buyItemPrice) {
            buyItemPrice.textContent = item.price ?? 0;
        } else {
            const detailPrice = document.getElementById('detailPrice');
            if (detailPrice) {
                detailPrice.innerHTML = `<img src="img/robux-blue.png" alt="Robux" style="width: 23.6px; height: 26px; vertical-align: -3px; margin-right: 6px;"> ${item.price ?? 0}`;
            }
        }

        // Link Sketchfab
        const existingSketchfabLink = document.getElementById('sketchfabLink');
        if (existingSketchfabLink) existingSketchfabLink.remove();
        if (item.viewerUrl && detailDescEl) {
            const link = document.createElement('a');
            link.id = 'sketchfabLink';
            link.href = item.viewerUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = 'Xem trên Sketchfab ↗';
            link.style.display = 'inline-block';
            link.style.marginTop = '8px';
            detailDescEl.insertAdjacentElement('afterend', link);
        }

        // Render Thumbnail
        const thumbContainer = document.getElementById('thumbnailContainer');
        if (thumbContainer) thumbContainer.innerHTML = '';

        let thumbnailList = (item.thumbnails && item.thumbnails.length > 0) ? item.thumbnails : [];
        if (thumbnailList.length === 0) {
            thumbnailList = [item.image || 'img/logo.png'];
        }

        const detailImg = document.getElementById('detailImg');
        if (detailImg) detailImg.src = thumbnailList[0];

        if (thumbContainer) {
            thumbnailList.forEach((imgUrl, index) => {
                const img = document.createElement('img');
                img.src = imgUrl;
                img.className = `thumb-item ${index === 0 ? 'active' : ''}`;
                img.onerror = () => { img.src = 'img/logo.png'; };
                img.onclick = () => changeMainImage(imgUrl, img);
                thumbContainer.appendChild(img);
            });
        }

        // 4. Sự kiện bấm Nút Buy Now (Đã sửa dùng biến `item`)
        const buyBtn = document.getElementById('buyBtn');
        if (buyBtn) {
            buyBtn.addEventListener('click', () => {
                const cartKey = `cart_${currentUser.username}`;
                let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
                cart.push(item);
                localStorage.setItem(cartKey, JSON.stringify(cart));
                alert(`Added ${item.name} into your cart!`);
            });
        }

        // 5. Nút Yêu thích / Like / Dislike
        const itemId = item.id || `sketchfab_${item.assetId}`;
        const favoriteBtn = document.getElementById('favoriteBtn');
        const likeBtn = document.getElementById('likeBtn');
        const dislikeBtn = document.getElementById('dislikeBtn');
        const likeCount = document.getElementById('likeCount');
        const dislikeCount = document.getElementById('dislikeCount');

        function refreshReactionUI() {
            if (typeof getItemReaction !== 'function') return;
            const entry = getItemReaction(itemId);
            if (likeCount) likeCount.textContent = entry.likes.length;
            if (dislikeCount) dislikeCount.textContent = entry.dislikes.length;

            const currentType = getUserReactionType(currentUser.username, itemId);
            if (likeBtn) {
                likeBtn.classList.toggle('active', currentType === 'like');
                likeBtn.classList.add('like');
            }
            if (dislikeBtn) {
                dislikeBtn.classList.toggle('active', currentType === 'dislike');
                dislikeBtn.classList.add('dislike');
            }
        }

        if (favoriteBtn && typeof toggleFavorite === 'function') {
            const favItemSnapshot = { ...item, id: itemId };
            const isFav = isFavorited(currentUser.username, itemId);
            favoriteBtn.classList.toggle('active', isFav);
            favoriteBtn.innerHTML = isFav ? '♥ Favorited' : '♡ Favorite';

            favoriteBtn.addEventListener('click', () => {
                const nowActive = toggleFavorite(currentUser.username, favItemSnapshot);
                favoriteBtn.classList.toggle('active', nowActive);
                favoriteBtn.innerHTML = nowActive ? '♥ Favorited' : '♡ Favorite';
            });
        }

        if (likeBtn && dislikeBtn && typeof setUserReaction === 'function') {
            refreshReactionUI();

            likeBtn.addEventListener('click', () => {
                setUserReaction(currentUser.username, itemId, 'like');
                refreshReactionUI();
            });
            dislikeBtn.addEventListener('click', () => {
                setUserReaction(currentUser.username, itemId, 'dislike');
                refreshReactionUI();
            });
        }
    } else {
        alert('Item not found!');
        window.location.href = 'home.html';
    }
});