// robloxApi.js — giờ dùng Sketchfab API (giữ nguyên tên file để không phải
// sửa lại các thẻ <script> đã nhúng ở nhiều trang).
// Sketchfab API v3 hỗ trợ gọi trực tiếp từ trình duyệt (không cần CORS proxy).

async function fetchJsonWithFallback(targetUrl, cacheMinutes = 15) {
    const cacheKey = `cache_${targetUrl}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
        try {
            const { timestamp, data } = JSON.parse(cached);
            if (Date.now() - timestamp < cacheMinutes * 60 * 1000) {
                return data;
            }
        } catch (e) {
            localStorage.removeItem(cacheKey);
        }
    }

    const res = await fetch(targetUrl);
    if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();

    localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data }));
    return data;
}

// Tìm model 3D trên Sketchfab theo từ khóa, chuẩn hóa thành item của Ro-Store
// (assetId = uid của Sketchfab).
async function fetchSketchfabModels(query, count = 12) {
    const url = `https://api.sketchfab.com/v3/search?type=models&q=${encodeURIComponent(query)}&count=${count}`;
    const data = await fetchJsonWithFallback(url, 30);

    if (!data || !Array.isArray(data.results)) return [];

    return data.results.map(model => {
        const images = (model.thumbnails && model.thumbnails.images) || [];
        const best = images.find(img => img.width >= 300) || images[images.length - 1] || images[0];

        return {
            assetId: model.uid,
            id: 'sketchfab_' + model.uid,
            name: model.name || 'Untitled Model',
            price: 0,
            description: model.description ? model.description.substring(0, 90) + '...' : 'Sketchfab 3D Model',
            image: best ? best.url : 'img/logo.png',
            createdBy: (model.user && (model.user.displayName || model.user.username)) || 'Sketchfab Creator'
        };
    });
}

// Lấy chi tiết đầy đủ 1 model theo uid: tên, mô tả, tác giả, toàn bộ ảnh
// thumbnail (nhiều kích thước) và link xem trên Sketchfab. Dùng cho trang
// chi tiết sản phẩm khi chỉ có assetId (không có sẵn dữ liệu đầy đủ).
async function fetchSketchfabModelDetails(uid) {
    const cacheKey = `sketchfab_detail_${uid}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);

    const data = await fetchJsonWithFallback(`https://api.sketchfab.com/v3/models/${uid}`, 60);
    const images = (data && data.thumbnails && data.thumbnails.images) || [];

    const result = {
        name: data.name || 'Sketchfab Model',
        description: data.description || 'Sketchfab 3D Model',
        createdBy: (data.user && (data.user.displayName || data.user.username)) || 'Sketchfab Creator',
        thumbnails: images.map(img => img.url),
        viewerUrl: data.viewerUrl || `https://sketchfab.com/models/${uid}`
    };

    localStorage.setItem(cacheKey, JSON.stringify(result));
    return result;
}