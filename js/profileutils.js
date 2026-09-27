// profileUtils.js — helper dùng chung để lấy avatar, huy hiệu (owner/verified)
// của 1 tài khoản. Dùng ở home.js (kết quả tìm kiếm profile) và profile.js.

const OWNER_USERNAME = 'BaconVN1092';

function getUserRecord(username) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    return users.find(u => u.username.toLowerCase() === username.toLowerCase());
}

function getUserAvatar(username) {
    const record = getUserRecord(username);
    return (record && record.avatar) ? record.avatar : 'img/default-avartar.png';
}

// Trả về HTML <img> huy hiệu: Owner (BaconVN1092, luôn có, đổi ảnh theo theme)
// hoặc Verified (do owner cấp, lưu trong record.verified) hoặc rỗng nếu không có.
function getUserBadgeHtml(username) {
    if (username.toLowerCase() === OWNER_USERNAME.toLowerCase()) {
        const isLight = document.documentElement.classList.contains('light-mode');
        const ownerImg = isLight ? 'img/owner-light.png' : 'img/owner-dark.png';
        return `<img src="${ownerImg}" alt="Owner" class="badge-icon" title="Chủ sở hữu">`;
    }

    const record = getUserRecord(username);
    if (record && record.verified) {
        return `<img src="img/verified.png" alt="Verified" class="badge-icon" title="Đã xác minh">`;
    }

    return '';
}