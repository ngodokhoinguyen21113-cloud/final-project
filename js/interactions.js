// interactions.js — Yêu thích (Favorites) & Like/Dislike, dùng chung nhiều trang.
// Lưu trữ trong LocalStorage:
//   favorites_<username>  -> mảng các item đã lưu (snapshot đầy đủ)
//   reactions              -> { [itemId]: { likes: [username...], dislikes: [username...] } }

function getFavorites(username) {
    return JSON.parse(localStorage.getItem(`favorites_${username}`)) || [];
}

function saveFavorites(username, list) {
    localStorage.setItem(`favorites_${username}`, JSON.stringify(list));
}

function isFavorited(username, itemId) {
    return getFavorites(username).some(i => String(i.id) === String(itemId));
}

// Thêm/gỡ 1 item khỏi danh sách yêu thích của user. Trả về true nếu SAU khi
// bấm, item đang được yêu thích (để cập nhật icon trái tim).
function toggleFavorite(username, item) {
    const list = getFavorites(username);
    const idx = list.findIndex(i => String(i.id) === String(item.id));
    if (idx >= 0) {
        list.splice(idx, 1);
        saveFavorites(username, list);
        return false;
    }
    list.unshift(item);
    saveFavorites(username, list);
    return true;
}

function getAllReactions() {
    return JSON.parse(localStorage.getItem('reactions')) || {};
}

function saveAllReactions(data) {
    localStorage.setItem('reactions', JSON.stringify(data));
}

function getItemReaction(itemId) {
    const all = getAllReactions();
    return all[itemId] || { likes: [], dislikes: [] };
}

function getUserReactionType(username, itemId) {
    const entry = getItemReaction(itemId);
    if (entry.likes.includes(username)) return 'like';
    if (entry.dislikes.includes(username)) return 'dislike';
    return null;
}

// Đặt (hoặc bỏ, nếu bấm lại đúng loại đang chọn) trạng thái like/dislike của
// user cho 1 item. type: 'like' | 'dislike'. Trả về entry mới {likes,dislikes}.
function setUserReaction(username, itemId, type) {
    const all = getAllReactions();
    if (!all[itemId]) all[itemId] = { likes: [], dislikes: [] };
    const entry = all[itemId];

    const alreadyThisType = entry[type + 's'] ? entry[type + 's'].includes(username) : false;

    entry.likes = entry.likes.filter(u => u !== username);
    entry.dislikes = entry.dislikes.filter(u => u !== username);

    if (!alreadyThisType) {
        entry[type + 's'].push(username);
    }

    saveAllReactions(all);
    return entry;
}