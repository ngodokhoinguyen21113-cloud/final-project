// // Escape HTML an toàn
// function escapeHtmlNotif(str) {
//     return String(str ?? '')
//         .replace(/&/g, '&amp;')
//         .replace(/</g, '&lt;')
//         .replace(/>/g, '&gt;')
//         .replace(/"/g, '&quot;')
//         .replace(/'/g, '&#039;');
// }

// // Hàm tải dữ liệu thông báo
// function loadBuyersNotification() {
//     const currentUser = JSON.parse(localStorage.getItem('currentUser'));
//     const notifList = document.getElementById('notifList');
//     const notifBadge = document.getElementById('notifBadge');

//     if (!currentUser || !notifList) return;

//     const customItems = JSON.parse(localStorage.getItem('customItems')) || [];
//     const myItemIds = customItems
//         .filter(item => item.createdBy === currentUser.username)
//         .map(item => item.id);

//     if (myItemIds.length === 0) {
//         notifList.innerHTML = '<div style="padding: 15px; text-align: center; color: #8f949e; font-size: 13px;">Bạn chưa tạo sản phẩm nào.</div>';
//         if (notifBadge) notifBadge.style.display = 'none';
//         return;
//     }

//     let buyersMap = [];
//     for (let i = 0; i < localStorage.length; i++) {
//         const key = localStorage.key(i);
//         if (key.startsWith('cart_')) {
//             const buyerUsername = key.replace('cart_', '');
//             if (buyerUsername === currentUser.username) continue;

//             const cart = JSON.parse(localStorage.getItem(key)) || [];
//             cart.forEach(item => {
//                 if (myItemIds.includes(item.id)) {
//                     buyersMap.push({
//                         buyer: buyerUsername,
//                         itemName: item.name,
//                         price: item.price
//                     });
//                 }
//             });
//         }
//     }

//     if (buyersMap.length === 0) {
//         notifList.innerHTML = '<div style="padding: 15px; text-align: center; color: #8f949e; font-size: 13px;">Chưa có ai mua/thêm sản phẩm của bạn.</div>';
//         if (notifBadge) notifBadge.style.display = 'none';
//     } else {
//         if (notifBadge) {
//             notifBadge.textContent = buyersMap.length;
//             notifBadge.style.display = 'inline-block';
//         }

//         notifList.innerHTML = buyersMap.map(b => `
//             <div style="padding: 12px; border-bottom: 1px solid #23272e; font-size: 13px; color: #cccccc; line-height: 1.4;">
//                 👤 <strong style="color: #ffffff;">${escapeHtmlNotif(b.buyer)}</strong> đã thêm <strong>"${escapeHtmlNotif(b.itemName)}"</strong> (${b.price} Robux) vào giỏ hàng!
//             </div>
//         `).join('');
//     }
// }

// // Hàm toggler gọi trực tiếp từ nút HTML
// window.toggleNotifDropdown = function (event) {
//     if (event) {
//         event.preventDefault();
//         event.stopPropagation();
//     }

//     const notifDropdown = document.getElementById('notifDropdown');
//     if (!notifDropdown) return;

//     const isHidden = window.getComputedStyle(notifDropdown).display === 'none';
//     notifDropdown.style.display = isHidden ? 'block' : 'none';

//     if (isHidden) {
//         loadBuyersNotification();
//     }
// };

// // Đóng dropdown khi bấm ra ngoài
// document.addEventListener('click', (e) => {
//     const notifDropdown = document.getElementById('notifDropdown');
//     const notifBtn = document.getElementById('notifBtn');
//     if (notifDropdown && notifBtn) {
//         if (!notifDropdown.contains(e.target) && !notifBtn.contains(e.target)) {
//             notifDropdown.style.display = 'none';
//         }
//     }
// });

// // Chạy cập nhật badge số lượng ban đầu khi load trang
// document.addEventListener('DOMContentLoaded', () => {
//     loadBuyersNotification();
// });