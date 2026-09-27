// theme.js — áp dụng chế độ Sáng/Tối đã lưu, dùng chung cho MỌI trang.
// Nhúng file này ở đầu <head> (trước link css) trên tất cả các trang HTML
// để chế độ giao diện được giữ đồng nhất xuyên suốt trang web.
(function () {
    function applyTheme(mode) {
        document.documentElement.classList.toggle('light-mode', mode === 'light');
    }

    // Áp dụng ngay khi file được tải, trước khi trang render xong
    applyTheme(localStorage.getItem('themeMode') || 'dark');

    // Hàm dùng chung để các trang khác (vd settings.html) đổi & lưu theme
    window.setThemeMode = function (mode) {
        localStorage.setItem('themeMode', mode);
        applyTheme(mode);
    };
})();