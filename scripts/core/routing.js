const renderHomePage = () => {
    return `
        <div id="home-hero">
            <canvas id="ascii-name" aria-label="A spinning 3D rendering of benjury.dev made from hash characters">
                benjury.dev
            </canvas>
        </div>
        ${aboutMe()}
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
    contact: {
        label: "Contact",
        render: renderContactPage,
        setup: setupContactPage,
    },
    projects: {
        label: "Projects",
        render: renderProjectsPage,
        setup: setupProjectsPage,
    },
    home: {
        render: renderHomePage,
        setup: setupCanvas,
    },
    about: {
        render: renderAboutPage,
        setup: setupTerminal,
    },
    fish: {
        label: "My_Fish_Tank",
        render: renderFishPage,
        setup: setupFishPage,
    },
};

let currentCleanup = null;

const getRoutePath = (routeName) => routeName === "home" ? "/" : `/${routeName}`;

const navigateTo = (routeName, shouldUpdateHistory = true) => {
    const mainCon = document.querySelector("#main-con");
    const normalizedRouteName = Object.hasOwn(routes, routeName) ? routeName : "home";
    const route = routes[normalizedRouteName];

    if (currentCleanup) {
        currentCleanup();
        currentCleanup = null;
    }

    mainCon.innerHTML = route.render();
    document.getElementById("page-label").textContent = route.label ?? "Welcome";
    currentCleanup = route.setup?.() ?? null;

    const routePath = getRoutePath(normalizedRouteName) + window.location.search;
    if (shouldUpdateHistory && window.location.pathname + window.location.search + window.location.hash !== routePath) {
        window.history.pushState(null, "", routePath);
    }

    window.dispatchEvent(new Event("routechange"));
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
};

const syncRouteFromLocation = () => {
    // Keep old bookmarks working, replacing their fragment with the clean path.
    const legacyRoute = window.location.hash.slice(1);
    const pathRoute = window.location.pathname.replace(/^\/+|\/+$/g, "");
    const requestedRoute = Object.hasOwn(routes, legacyRoute) ? legacyRoute : pathRoute;
    const routeName = Object.hasOwn(routes, requestedRoute) ? requestedRoute : "home";
    const routePath = getRoutePath(routeName) + window.location.search;

    if (window.location.pathname + window.location.search + window.location.hash !== routePath) {
        window.history.replaceState(null, "", routePath);
    }

    navigateTo(routeName, false);
};

document.addEventListener("click", (event) => {
    const routeTarget = event.target.closest("[data-route]");

    if (!routeTarget) {
        return;
    }

    navigateTo(routeTarget.dataset.route);
});

window.addEventListener("popstate", syncRouteFromLocation);
window.addEventListener("hashchange", () => {
    if (window.location.hash) syncRouteFromLocation();
});

syncRouteFromLocation();
