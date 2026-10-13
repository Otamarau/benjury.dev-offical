const fishProfiles = [
    { id: "fishOne", name: "Oliver" },
    { id: "fishTwo", name: "Mitch" },
    { id: "fishThree", name: "Zach" },
    { id: "fishFour", name: "Daniel" },
];

const fishDesc = () => `
    <br>
    <section id="fish-desc-container" aria-label="Meet the fish">
        ${fishProfiles.map(({ id, name }) => `
            <article class="fish-desc" aria-labelledby="${id}-name">
                <pre class="fish-pfp" id="${id}-portrait" role="img" aria-label="${name} ASCII portrait"></pre>
                <div class="fish-desc-text">
                    <h3 id="${id}-name">${name}</h3>
                    <div class="fish-hunger">
                        <label for="${id}-hunger">Hunger</label>
                        <span id="${id}-status">Hungry</span>
                        <meter id="${id}-hunger" min="0" max="100" low="30" high="75" optimum="0" value="100" aria-describedby="${id}-status">100%</meter>
                    </div>
                </div>
            </article>
        `).join("")}
    </section>
`;
