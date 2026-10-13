const aboutMe = () => {
    return `
        <section id="about-me" aria-labelledby="about-me-title">
            <h1 id="about-me-title">About Me</h1>
            <p>
                Hello! My name is Ben Jury, and this is where I have fun with web development. This website is still under construction, but I hope you enjoy it!
            </p>
            <br>
            <h1 id="about-page-title">What is this page?</h1>
            <p>
                This animation uses JavaScript and the HTML Canvas 2D API to render a 3D cloud of ASCII characters. The text is sampled from an offscreen canvas and expanded into five depth layers, giving each character a position in 3D space. On load, the characters ease from scattered positions into the shape of benjury.dev. Each frame applies a rotation matrix and perspective projection, with character size and shading changing according to depth. Mouse and touch dragging control the rotation, while momentum and damping let it coast after release. The characters are drawn from a pre-rendered sprite atlas to avoid redrawing individual glyphs every frame.
            </p>
        </section>

    `;
};
