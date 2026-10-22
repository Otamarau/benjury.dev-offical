(() => {
    const nav = document.querySelector("nav");
    const toggle = document.getElementById("nav-toggle");
    const links = document.getElementById("i-con");
    const mobile = window.matchMedia("(max-width: 700px)");

    const setOpen = (open) => {
        const expanded = open && mobile.matches;
        if (!expanded && mobile.matches && links.contains(document.activeElement)) {
            toggle.focus();
        }
        toggle.setAttribute("aria-expanded", String(expanded));
        nav.classList.toggle("is-menu-open", expanded);
    };

    toggle.addEventListener("click", () => {
        setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    document.addEventListener("click", (event) => {
        if (!nav.contains(event.target) || event.target.closest("[data-route]")) {
            setOpen(false);
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
            setOpen(false);
            toggle.focus();
        }
    });

    nav.addEventListener("focusout", (event) => {
        if (!nav.contains(event.relatedTarget)) setOpen(false);
    });

    mobile.addEventListener("change", () => {
        setOpen(false);
        if (!mobile.matches && document.activeElement === toggle) {
            links.querySelector("button").focus();
        }
    });

    window.addEventListener("routechange", () => setOpen(false));
})();
