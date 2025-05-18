document.addEventListener("DOMContentLoaded", function () {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i'); 

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        themeIcon.className = savedTheme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    }

    themeToggle.addEventListener('click', () => {
        let currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        let newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeIcon.className = newTheme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    });
});
