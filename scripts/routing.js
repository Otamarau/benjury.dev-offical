const renderHomePage = () => {
    return `
        <canvas id="ascii-name" aria-label="A spinning 3D rendering of benjury.dev made from hash characters">
            benjury.dev
        </canvas>
    `;
};

const renderAboutPage = () => {
    return `
        <div id="aboutme-con">
            <!-- <h2>aboutme.txt</h2> -->

            <div class="runner-con">
                <div class="runner">
                    <h2>aboutme.js</h2>
                </div>
            </div>

            <br>

            <div id="command-container">

                <div class="command">
                    <span class="prompt">ben@benjury.dev#</span>
                    <span class="command-entry">
                        <span id="welcome-text" class="command-text"></span>
                    </span>
                </div>
                <!-- <br> -->
                <div id="user-command" class="command" tabindex="0">
                    <span class="prompt">you@benjury.dev#</span>
                    <span class="command-entry">
                        <span id="terminal-input" class="command-text"></span>
                        <span class="terminal-cursor" aria-hidden="true"></span>
                    </span>
                </div>

            </div>
        </div>
    `;
};

const routes = {
    home: {
        render: renderHomePage,
        setup: setupCanvas,
    },
    about: {
        render: renderAboutPage,
        setup: setupTerminal,
    },
    fish: {
        render: renderFishPage,
        setup: setupFishPage,
    },
};

let currentCleanup = null;

const navigateTo = (routeName, shouldUpdateHash = true) => {
    const mainCon = document.querySelector("#main-con");
    const route = routes[routeName] ?? routes.home;
    const normalizedRouteName = routes[routeName] ? routeName : "home";

    if (currentCleanup) {
        currentCleanup();
        currentCleanup = null;
    }

    mainCon.innerHTML = route.render();
    currentCleanup = route.setup?.() ?? null;

    if (shouldUpdateHash && window.location.hash !== `#${normalizedRouteName}`) {
        window.location.hash = normalizedRouteName;
    }
};

document.addEventListener("click", (event) => {
    const routeTarget = event.target.closest("[data-route]");

    if (!routeTarget) {
        return;
    }

    navigateTo(routeTarget.dataset.route);
});

window.addEventListener("hashchange", () => {
    navigateTo(window.location.hash.slice(1) || "home", false);
});

navigateTo(window.location.hash.slice(1) || "home", false);
