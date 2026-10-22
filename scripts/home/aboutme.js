const aboutMe = () => {
    return `
        <section id="about-me" aria-labelledby="about-me-title">
            <div class="home-copy-section">
                <h2 id="about-me-title">About me</h2>
                <div class="home-copy">
                    <p class="home-intro">Hello, I'm Ben Jury.</p>
                    <p>
                        This is where I have fun with web development. It's still a work in progress, but I hope you enjoy exploring.
                    </p>
                </div>
            </div>
            <section class="home-copy-section" aria-labelledby="about-page-title">
                <h2 id="about-page-title">Behind the animation</h2>
                <div class="home-copy">
                    <p>
                        A cloud of ASCII characters, brought to life with JavaScript and the HTML Canvas 2D API. Drag with your mouse or finger to rotate it, then let go and watch it coast.
                    </p>
                    <p>
                        The text is sampled from an offscreen canvas and spread across five depth layers. On load, the scattered characters ease into the shape of <span class="home-inline-name">benjury.dev</span>. Rotation and perspective give the cloud its 3D shape, with character size and shading changing with depth.
                    </p>
                    <p>
                        Momentum and damping keep the movement smooth after you let go. A pre-rendered sprite atlas supplies the glyphs, so they don't need to be redrawn individually every frame.
                    </p>
                </div>
            </section>
        </section>

    `;
};
