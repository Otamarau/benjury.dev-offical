const jellyfishCharacterColors = {
    "\\": "hotpink",
    "/": "hotpink",
    "|": "hotpink",
    "_": "hotpink",
    "-": "gold",
    "~": "orange",
    "(": "hotpink",
    ")": "hotpink",
    "<": "tomato",
    ">": "tomato",
    "{": "gold",
    "o": "lightskyblue",
    "#": "mediumturquoise",
    "*": "yellow",
    ".": "lightskyblue",
    ",": "orchid",
    "\"": "plum",
    "'": "lightsalmon",
    "`": "lightcoral",
};

const createRandomCharacterColors = (baseColors) => {
    const colorGroups = [...new Set(Object.values(baseColors))];
    const shuffledColors = [...colorGroups];

    for (let index = shuffledColors.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffledColors[index], shuffledColors[randomIndex]] = [
            shuffledColors[randomIndex],
            shuffledColors[index],
        ];
    }

    const colorMap = Object.fromEntries(
        colorGroups.map((color, index) => [color, shuffledColors[index]])
    );

    return Object.fromEntries(
        Object.entries(baseColors).map(([character, color]) => [
            character,
            colorMap[color],
        ])
    );
};

const getPersistentCharacterColors = (storageKey, baseColors) => {
    try {
        const savedColors = window.localStorage.getItem(storageKey);

        if (savedColors) {
            const parsedColors = JSON.parse(savedColors);
            const hasEveryCharacter = Object.keys(baseColors).every(
                (character) => typeof parsedColors[character] === "string"
            );

            if (hasEveryCharacter) {
                return parsedColors;
            }
        }
    } catch (error) {
        console.warn(`Could not read ${storageKey}`, error);
    }

    const randomColors = createRandomCharacterColors(baseColors);

    try {
        window.localStorage.setItem(storageKey, JSON.stringify(randomColors));
    } catch (error) {
        console.warn(`Could not save ${storageKey}`, error);
    }

    return randomColors;
};

const fishOneCharacterColors = {
    "/": "gold",
    "\\": "gold",
    "_": "gold",
    "<": "orange",
    ">": "orange",
    "|": "darkorange",
    "o": "lightskyblue",
    ")": "orange",
};
const fishThreeCharacterColors = getPersistentCharacterColors(
    "asciiFish.colors.fishThree",
    jellyfishCharacterColors
);
const fishFourCharacterColors = getPersistentCharacterColors(
    "asciiFish.colors.fishFour",
    jellyfishCharacterColors
);

const renderFishPage = () => {
    return `
        ${aboutFish()}
        <div id="fishpage-con">
            <canvas id="ascii-fish" aria-label="Four ASCII sea creatures exploring the tank and eating food">
                ASCII sea creatures
            </canvas>
        </div>
        ${fishDesc()}
    `;
};


const setupFishPage = () => {
    const canvas = document.getElementById("ascii-fish");

    if (!canvas) {
        return null;
    }

    const context = canvas.getContext("2d");
    const fishOne = [
        "       /|",
        "     /| |\\",
        "   /o)| | \\  /|",
        "  <   | |  >< |",
        "   \\ | | /  \\|",
        "     \\| |/",
        "       \\|",
    ];
    const fishTwo = [
        "      _______",
        " ,-~~~       ~~~-,",
        "(                 )",
        " \\_-, , , , , ,-_/",
        "    / / | | \\ \\",
        "    | | | | | |",
        "    | | | | | |",
        "   / / /   \\ \\ \\",
        "   | | |   | | |",
    ];
    const fishThree = [
        "  __/|__",
        " / o)   \\  /|",
        ">    {   |< |",
        " \\______/  \\|",
    ];
    const fishFour = [
        "  __/|__",
        " /.o)...\\  /|",
        ">....{...|<.|",
        " \\######/  \\|",
    ];
    const portraits = [
        ["fishOne", fishOne, fishOneCharacterColors],
        ["fishTwo", fishTwo, jellyfishCharacterColors],
        ["fishThree", fishThree, fishThreeCharacterColors],
        ["fishFour", fishFour, fishFourCharacterColors],
    ];
    portraits.forEach(([id, artwork, colors]) => {
        const portrait = document.getElementById(`${id}-portrait`);
        if (!portrait) return;
        const drawing = document.createElement("span");
        for (const character of artwork.join("\n")) {
            const span = document.createElement("span");
            span.textContent = character;
            span.style.color = colors[character] || "lightgreen";
            drawing.appendChild(span);
        }
        portrait.replaceChildren(drawing);
    });

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const waterSurfacePosition = 0.15;
    const bubbleCharacters = [".", "0", "o"];
    const footballs = [];
    let footballCharacter = "o";
    const footballFontSize = 40;
    const footballColor = "gold";
    const creatureStates = {};
    const hungerCooldown = 15 * 60 * 1000;
    const hungerDisplays = fishProfiles.map(({ id }) => ({
        id,
        meter: document.getElementById(`${id}-hunger`),
        status: document.getElementById(`${id}-status`),
    }));
    const updateHungerMeters = () => {
        const now = Date.now();
        hungerDisplays.forEach(({ id, meter, status }) => {
            const lastAteAt = creatureStates[id]?.lastAteAt;
            const hunger = lastAteAt
                ? Math.min(100, Math.max(0, (now - lastAteAt) / hungerCooldown * 100))
                : 100;
            if (meter) {
                meter.value = hunger;
                meter.textContent = `${Math.round(hunger)}%`;
                meter.setAttribute("aria-valuetext", `${Math.round(hunger)}% hungry`);
            }
            if (status) {
                status.textContent = hunger >= 100 ? "Hungry" : hunger < 30 ? "Full" : "Digesting";
            }
        });
    };

    const bubbles = Array.from({ length: 18 }, () => ({
        character: bubbleCharacters[Math.floor(Math.random() * bubbleCharacters.length)],
        horizontalPosition: 0.05 + Math.random() * 0.9,
        duration: 5000 + Math.random() * 5000,
        timeOffset: Math.random() * 10000,
        wobbleSpeed: 0.0015 + Math.random() * 0.002,
        wobbleAmount: 3 + Math.random() * 7,
        wobbleOffset: Math.random() * Math.PI * 2,
        fontSize: 8 + Math.random() * 6,
    }));
    const kelpStalks = [
        { horizontalPosition: 0.06, segmentCount: 7, phase: 0.2, swaySpeed: 0.0011 },
        { horizontalPosition: 0.18, segmentCount: 5, phase: 1.5, swaySpeed: 0.0014 },
        { horizontalPosition: 0.33, segmentCount: 8, phase: 2.8, swaySpeed: 0.0009 },
        { horizontalPosition: 0.51, segmentCount: 6, phase: 4.1, swaySpeed: 0.0012 },
        { horizontalPosition: 0.69, segmentCount: 9, phase: 5.4, swaySpeed: 0.001 },
        { horizontalPosition: 0.84, segmentCount: 5, phase: 0.9, swaySpeed: 0.0013 },
        { horizontalPosition: 0.95, segmentCount: 7, phase: 3.6, swaySpeed: 0.0011 },
    ];
    let animationFrame = 0;
    let canvasWidth = 0;
    let canvasHeight = 0;
    let pixelRatio = 1;
    let lastFrameTime = 0;
    let frameElapsed = 0;

    fetch("ascii-fish/foodball.txt")
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Could not load foodball.txt (${response.status})`);
            }

            return response.text();
        })
        .then((text) => {
            const loadedCharacter = text.trim();

            if (loadedCharacter) {
                footballCharacter = loadedCharacter;
            }
        })
        .catch((error) => console.warn(error));

    const resizeCanvas = () => {
        const bounds = canvas.getBoundingClientRect();
        const nextPixelRatio = Math.min(window.devicePixelRatio || 1, 2);

        if (
            bounds.width === canvasWidth
            && bounds.height === canvasHeight
            && nextPixelRatio === pixelRatio
        ) {
            return;
        }

        canvasWidth = bounds.width;
        canvasHeight = bounds.height;
        pixelRatio = nextPixelRatio;
        canvas.width = Math.round(bounds.width * pixelRatio);
        canvas.height = Math.round(bounds.height * pixelRatio);
    };

    const drawCreature = ({
        id,
        artwork,
        time,
        verticalPosition,
        colorMap,
        sizeScale = 1,
        seeksFood = false,
    }) => {
        const creatureState = creatureStates[id] ?? {
            x: null,
            y: null,
            growth: 0,
            lastAteAt: 0,
            destination: null,
            foodTarget: null,
            pauseRemaining: 0,
            cruiseSpeed: 0,
            speed: 0,
            facing: -1,
            scaleX: -1,
            bobOffset: 0,
            bobPhase: Math.random() * Math.PI * 2,
            bobSpeed: 0.0015 + Math.random() * 0.001,
            bobHeight: 3 + Math.random() * 3,
        };
        creatureStates[id] = creatureState;
        const longestLineLength = Math.max(...artwork.map((line) => line.length));
        const fontSizeFromWidth = canvasWidth / (longestLineLength * 0.68);
        const fontSizeFromHeight = canvasHeight / (artwork.length * 1.25);
        const fontSize = Math.max(
            9,
            Math.min(fontSizeFromWidth, fontSizeFromHeight) * 0.105
        ) * sizeScale * (1 + creatureState.growth);
        const lineHeight = fontSize * 1.25;
        const blockHeight = artwork.length * lineHeight;

        context.font = `${fontSize}px Consolas, "Courier New", monospace`;
        const visibleBounds = artwork.reduce(
            (bounds, line) => {
                const firstVisibleIndex = line.search(/\S/);

                if (firstVisibleIndex === -1) {
                    return bounds;
                }

                const lastVisibleIndex = line.search(/\s*$/);
                return {
                    left: Math.min(
                        bounds.left,
                        context.measureText(line.slice(0, firstVisibleIndex)).width
                    ),
                    right: Math.max(
                        bounds.right,
                        context.measureText(line.slice(0, lastVisibleIndex)).width
                    ),
                };
            },
            { left: Infinity, right: -Infinity }
        );
        const creatureWidth = visibleBounds.right - visibleBounds.left;
        const artworkOffsetX = -(visibleBounds.left + visibleBounds.right) / 2;
        const leftEdge = Math.min(canvasWidth / 2, creatureWidth / 2 + 8);
        const rightEdge = Math.max(leftEdge, canvasWidth - leftEdge);
        const topEdge = Math.min(canvasHeight, canvasHeight * waterSurfacePosition + blockHeight / 2 + 8);
        const bottomEdge = Math.max(topEdge, canvasHeight - blockHeight / 2 - 8);
        const clampX = (value) => Math.max(leftEdge, Math.min(rightEdge, value));
        const clampY = (value) => Math.max(topEdge, Math.min(bottomEdge, value));
        const randomDestination = () => ({
            x: leftEdge + Math.random() * (rightEdge - leftEdge),
            y: topEdge + Math.random() * (bottomEdge - topEdge),
        });
        const chooseSpeed = () => 35 + Math.random() * 30;

        if (creatureState.x === null) {
            creatureState.x = randomDestination().x;
            creatureState.y = clampY(canvasHeight * verticalPosition);
            creatureState.destination = randomDestination();
            creatureState.cruiseSpeed = chooseSpeed();
        }
        creatureState.x = clampX(creatureState.x);
        creatureState.y = clampY(creatureState.y);

        const isHungry = Date.now() - creatureState.lastAteAt >= hungerCooldown;
        const canEat = (food) => footballs.includes(food)
            && food.scale > 0.08
            && food.y >= canvasHeight * waterSurfacePosition
            && (food.eatenBy === id || (!food.eatenBy && isHungry));
        let availableFood = creatureState.foodTarget;
        if (!availableFood || !canEat(availableFood)) {
            availableFood = seeksFood
                ? footballs.filter(canEat).sort((a, b) =>
                    Math.hypot(a.x - creatureState.x, a.y - creatureState.y)
                    - Math.hypot(b.x - creatureState.x, b.y - creatureState.y)
                )[0] ?? null
                : null;
        }
        if (availableFood !== creatureState.foodTarget) {
            creatureState.foodTarget = availableFood;
            creatureState.cruiseSpeed = chooseSpeed();
            // Losing a food target should send the fish exploring, not pause the group.
            creatureState.pauseRemaining = 0;
            creatureState.destination = randomDestination();
        }

        if (!reduceMotion) {
            const seconds = frameElapsed / 1000;
            if (availableFood) {
                // Approach with the mouth facing the food, using the same swimming motion.
                if (Math.abs(availableFood.x - creatureState.x) > creatureWidth / 2 + 4) {
                    creatureState.facing = availableFood.x < creatureState.x ? 1 : -1;
                }
                creatureState.destination = {
                    x: clampX(availableFood.x + creatureState.facing * creatureWidth / 2),
                    y: clampY(availableFood.y),
                };
            }

            if (creatureState.pauseRemaining > 0) {
                creatureState.pauseRemaining = Math.max(0, creatureState.pauseRemaining - seconds);
                creatureState.speed = 0;
                if (creatureState.pauseRemaining === 0) {
                    creatureState.destination = randomDestination();
                    creatureState.cruiseSpeed = chooseSpeed();
                }
            } else {
                const target = creatureState.destination;
                target.x = clampX(target.x);
                target.y = clampY(target.y);
                const dx = target.x - creatureState.x;
                const dy = target.y - creatureState.y;
                const distance = Math.hypot(dx, dy);
                const desiredSpeed = Math.min(creatureState.cruiseSpeed, distance * 1.8);
                creatureState.speed += (desiredSpeed - creatureState.speed) * (1 - Math.exp(-seconds * 3));
                const step = Math.min(distance, creatureState.speed * seconds);
                if (distance > 0) {
                    creatureState.x += dx / distance * step;
                    creatureState.y += dy / distance * step;
                }
                if (!availableFood && Math.abs(dx) > 3) {
                    creatureState.facing = dx < 0 ? 1 : -1;
                }
                if (!availableFood && distance < 2) {
                    const restingFish = Object.values(creatureStates).filter(
                        (state) => state !== creatureState && state.pauseRemaining > 0
                    ).length;
                    if (restingFish < 2) {
                        creatureState.pauseRemaining = 2 + Math.random() * 5;
                        creatureState.speed = 0;
                    } else {
                        // Keep some life in the tank when other fish are already resting.
                        creatureState.destination = randomDestination();
                        creatureState.cruiseSpeed = chooseSpeed();
                    }
                }
            }
            creatureState.scaleX += (creatureState.facing - creatureState.scaleX)
                * (1 - Math.exp(-seconds * 6));

            if (availableFood) {
                const mouthX = creatureState.x - creatureState.scaleX * creatureWidth / 2;
                const mouthDistance = Math.hypot(mouthX - availableFood.x, creatureState.y - availableFood.y);
                const foodRadius = footballFontSize * availableFood.scale / 2;
                if (mouthDistance < foodRadius + 14 || availableFood.eatenBy === id) {
                    if (!availableFood.eatenBy) {
                        creatureState.lastAteAt = Date.now();
                        updateHungerMeters();
                    }
                    availableFood.eatenBy = id;
                    availableFood.scale = Math.max(0.08, availableFood.scale - frameElapsed * 0.0008);
                    creatureState.growth = Math.min(0.14, creatureState.growth + frameElapsed * 0.00012);
                }
            }
        }

        const targetBob = !reduceMotion
            ? Math.sin(time * creatureState.bobSpeed + creatureState.bobPhase) * creatureState.bobHeight
            : 0;
        creatureState.bobOffset += (targetBob - creatureState.bobOffset)
            * (1 - Math.exp(-frameElapsed * 0.004));
        const x = creatureState.x;
        const centerY = clampY(creatureState.y + creatureState.bobOffset);
        const scaleX = creatureState.scaleX;
        const startY = -blockHeight / 2 + fontSize;

        context.save();
        context.translate(x, centerY);
        context.scale(scaleX, 1);
        context.fillStyle = "lightgreen";
        context.textAlign = "left";
        context.textBaseline = "alphabetic";

        artwork.forEach((line, index) => {
            let characterX = artworkOffsetX;
            for (const character of line) {
                context.fillStyle = colorMap[character] || "lightgreen";
                context.fillText(character, characterX, startY + index * lineHeight);
                characterX += context.measureText(character).width;
            }
        });
        context.restore();
    };

    const drawWaterSurface = () => {
        const fontSize = 14;

        context.save();
        context.font = `${fontSize}px Consolas, "Courier New", monospace`;
        context.fillStyle = "dodgerblue";
        context.textAlign = "left";
        context.textBaseline = "middle";

        const characterWidth = context.measureText("~").width;
        const characterCount = Math.ceil(canvasWidth / characterWidth) + 1;
        const waterSurface = "~".repeat(characterCount);

        context.fillText(waterSurface, 0, canvasHeight * waterSurfacePosition);
        context.restore();
    };

    const drawBubbles = (time) => {
        context.save();
        context.fillStyle = "lightskyblue";
        context.textAlign = "center";
        context.textBaseline = "middle";

        bubbles.forEach((bubble) => {
            const progress = reduceMotion
                ? bubble.timeOffset / 10000
                : ((time + bubble.timeOffset) % bubble.duration) / bubble.duration;
            const x = canvasWidth * bubble.horizontalPosition
                + Math.sin(time * bubble.wobbleSpeed + bubble.wobbleOffset)
                    * bubble.wobbleAmount;
            const y = canvasHeight * (
                0.95 - progress * (0.95 - waterSurfacePosition)
            );

            context.font = `${bubble.fontSize}px Consolas, "Courier New", monospace`;
            context.fillText(bubble.character, x, y);
        });

        context.restore();
    };

    const drawFootballs = (time) => {
        const waterY = canvasHeight * waterSurfacePosition;

        context.save();
        context.font = `${footballFontSize}px Consolas, "Courier New", monospace`;
        context.fillStyle = footballColor;
        context.textAlign = "center";
        context.textBaseline = "middle";

        for (let index = footballs.length - 1; index >= 0; index -= 1) {
            const football = footballs[index];

            if (!reduceMotion && !football.eatenBy) {
                if (football.y < waterY) {
                    football.velocity = Math.min(
                        football.velocity + frameElapsed * 0.001,
                        0.55
                    );
                    football.y += football.velocity * frameElapsed;
                } else {
                    football.y = Math.min(canvasHeight - 45, football.y + frameElapsed * 0.025);
                    football.x += Math.sin(time * 0.0015 + football.phase)
                        * frameElapsed * 0.015;
                    football.x = Math.max(20, Math.min(canvasWidth - 20, football.x));
                }
            }

            context.save();
            context.translate(football.x, football.y);
            context.scale(football.scale, football.scale);
            context.fillText(footballCharacter, 0, 0);
            context.restore();

            if (
                football.scale <= 0.08
                || football.y - footballFontSize / 2 > canvasHeight
            ) {
                footballs.splice(index, 1);
            }
        }

        context.restore();
    };

    const drawKelp = (time) => {
        const fontSize = 16;
        const segmentSpacing = fontSize * 0.85;

        context.save();
        context.font = `${fontSize}px Consolas, "Courier New", monospace`;
        context.fillStyle = "limegreen";
        context.textAlign = "center";
        context.textBaseline = "middle";

        kelpStalks.forEach((stalk) => {
            const horizontalScale = reduceMotion
                ? 1
                : Math.sign(Math.sin(time * stalk.swaySpeed + stalk.phase)) || 1;

            context.save();
            context.translate(
                canvasWidth * stalk.horizontalPosition,
                canvasHeight - fontSize / 2
            );
            context.scale(horizontalScale, 1);

            for (let segment = 0; segment < stalk.segmentCount; segment += 1) {
                const character = segment % 2 === 0 ? ")" : "(";
                context.fillText(character, 0, -segment * segmentSpacing);
            }

            context.restore();
        });

        context.restore();
    };

    const drawFish = (time = 0) => {
        resizeCanvas();
        frameElapsed = Math.min(Math.max(time - lastFrameTime, 0), 40);

        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        context.clearRect(0, 0, canvasWidth, canvasHeight);
        context.fillStyle = "#000";
        context.fillRect(0, 0, canvasWidth, canvasHeight);
        drawKelp(time);
        drawFootballs(time);

        drawCreature({
            id: "fishOne",
            artwork: fishOne,
            time,
            verticalPosition: 0.38,
            colorMap: fishOneCharacterColors,
            sizeScale: 1.1,
            seeksFood: true,
        });
        drawCreature({
            id: "fishTwo",
            seeksFood: true,
            artwork: fishTwo,
            time,
            verticalPosition: 0.78,
            colorMap: jellyfishCharacterColors,
            sizeScale: 0.96,
        });
        drawCreature({
            id: "fishThree",
            artwork: fishThree,
            time,
            verticalPosition: 0.58,
            colorMap: fishThreeCharacterColors,
            seeksFood: true,
        });
        drawCreature({
            id: "fishFour",
            artwork: fishFour,
            time,
            verticalPosition: 0.26,
            colorMap: fishFourCharacterColors,
            sizeScale: 0.9,
            seeksFood: true,
        });
        drawBubbles(time);
        drawWaterSurface();
        lastFrameTime = time;

        if (!reduceMotion) {
            animationFrame = requestAnimationFrame(drawFish);
        }
    };

    const queueDrawFish = () => {
        canvasWidth = 0;
        canvasHeight = 0;

        if (reduceMotion) {
            drawFish();
        }
    };

    const dropFootball = (event) => {
        const bounds = canvas.getBoundingClientRect();
        const x = event.clientX - bounds.left;
        const y = event.clientY - bounds.top;

        if (y >= bounds.height * waterSurfacePosition) {
            return;
        }

        footballs.push({
            x,
            y,
            velocity: 0,
            phase: Math.random() * Math.PI * 2,
            scale: 1,
            eatenBy: null,
        });

        if (reduceMotion) {
            drawFish();
        }
    };

    updateHungerMeters();
    const hungerInterval = window.setInterval(updateHungerMeters, 1000);

    window.addEventListener("resize", queueDrawFish);
    canvas.addEventListener("click", dropFootball);
    animationFrame = requestAnimationFrame(drawFish);

    return () => {
        window.clearInterval(hungerInterval);
        cancelAnimationFrame(animationFrame);
        window.removeEventListener("resize", queueDrawFish);
        canvas.removeEventListener("click", dropFootball);
    };
};
