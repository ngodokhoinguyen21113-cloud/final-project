document.addEventListener('DOMContentLoaded', () => {
    // 1. Kiểm tra trạng thái đăng nhập
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    const displayUsername = document.getElementById('displayUsername');
    if (displayUsername) {
        displayUsername.textContent = currentUser.username;
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }

    // 2. DOM Elements
    const addItemForm = document.getElementById('addItemForm');
    const itemNameInput = document.getElementById('itemName');
    const itemPriceInput = document.getElementById('itemPrice');
    const itemDescInput = document.getElementById('itemDesc');
    const itemImageInput = document.getElementById('itemImage');
    const itemFileInput = document.getElementById('itemFileInput');
    const fileNameDisplay = document.getElementById('fileNameDisplay');

    // Cập nhật tên file hiển thị
    if (itemFileInput && fileNameDisplay) {
        itemFileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                fileNameDisplay.textContent = e.target.files[0].name;
                fileNameDisplay.style.color = '#ffffff';
            } else {
                fileNameDisplay.textContent = 'No file chosen';
                fileNameDisplay.style.color = '#8f949e';
            }
        });
    }

    // Hàm đọc File thành Base64
    function convertFileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    }

    // 3. Xử lý Nộp Form
    if (addItemForm) {
        addItemForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = itemNameInput ? itemNameInput.value.trim() : '';
            const price = itemPriceInput ? (parseFloat(itemPriceInput.value) || 0) : 0;
            const description = itemDescInput ? itemDescInput.value.trim() : '';
            let finalImageUrl = itemImageInput ? itemImageInput.value.trim() : '';

            if (!name) {
                alert('Vui lòng nhập tên sản phẩm!');
                return;
            }

            // Nếu người dùng chọn file từ máy
            if (itemFileInput && itemFileInput.files && itemFileInput.files.length > 0) {
                try {
                    finalImageUrl = await convertFileToBase64(itemFileInput.files[0]);
                } catch (err) {
                    console.error('Lỗi đọc file:', err);
                }
            }

            // Ảnh mặc định nếu không có dữ liệu ảnh
            if (!finalImageUrl) {
                finalImageUrl = 'img/logo.png';
            }

            // Tạo đối tượng item chuẩn
            const newItem = {
                id: 'custom_' + Date.now(),
                name: name,
                price: price,
                description: description || 'No description available.',
                image: finalImageUrl,
                createdBy: currentUser.username
            };

            // Lưu vào localStorage
            const customItems = JSON.parse(localStorage.getItem('customItems')) || [];
            customItems.unshift(newItem); // Đẩy item mới lên đầu danh sách
            localStorage.setItem('customItems', JSON.stringify(customItems));

            alert('Thêm sản phẩm thành công!');
            window.location.href = 'home.html';
        });
    }
});