(() => {
    // Fragments never reach Express; translate old bookmarks into server requests.
    const legacyPaths = { home: '/', projects: '/projects', fish: '/fish', contact: '/contact', about: '/about' };
    const legacyPage = window.location.hash.slice(1);
    if (Object.hasOwn(legacyPaths, legacyPage)) {
        window.location.replace(legacyPaths[legacyPage] + window.location.search);
        return;
    }

    const page = document.body.dataset.page;
    document.querySelectorAll('#i-con a[href]').forEach(link => {
        if (link.pathname === window.location.pathname.replace(/\/$/, '') && link.origin === window.location.origin) {
            link.setAttribute('aria-current', 'page');
        }
    });

    if (page === 'home') setupCanvas();
    if (page === 'fish') setupFishPage();
    if (page === 'contact') setupContactPage();
    if (page === 'about') setupTerminal();
})();
