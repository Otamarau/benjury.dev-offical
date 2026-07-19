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

const fishOneCharacterColors = getPersistentCharacterColors(
    "asciiFish.colors.fishOne",
    jellyfishCharacterColors
);
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
        <div id="fishpage-con">
            <canvas id="ascii-fish" aria-label="Four ASCII sea creatures swimming back and forth">
                ASCII sea creatures
            </canvas>
        </div>
    `;
};

const setupFishPage = () => {
    const canvas = document.getElementById("ascii-fish");

    if (!canvas) {
        return null;
    }

    const context = canvas.getContext("2d");
    const fish = [
        "           /\"*._         _",
        "      .-*'`    `*-.._.-'/",
        "    < * ))     ,       (",
        "      `*-._`._(__.--*\"`\\",
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
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fishSwimDurations = {
        fishOne: 20873,
        fishTwo: 19178,
        fishThree: 22897,
        fishFour: 23760,
    };
    const turnDuration = 700;
    const bobHeight = 12;
    const waterSurfacePosition = 0.15;
    const bubbleCharacters = [".", "0", "o"];
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
        artwork,
        time,
        duration,
        verticalPosition,
        bobSpeed,
        colorMap,
        sizeScale = 1,
        phaseOffset = 0,
        flipAtEdges = true,
    }) => {
        const longestLineLength = Math.max(...artwork.map((line) => line.length));
        const fontSizeFromWidth = canvasWidth / (longestLineLength * 0.68);
        const fontSizeFromHeight = canvasHeight / (artwork.length * 1.25);
        const fontSize = Math.max(
            9,
            Math.min(fontSizeFromWidth, fontSizeFromHeight) * 0.105
        ) * sizeScale;
        const lineHeight = fontSize * 1.25;
        const blockHeight = artwork.length * lineHeight;

        context.font = `${fontSize}px Consolas, "Courier New", monospace`;
        const creatureWidth = Math.max(
            ...artwork.map((line) => context.measureText(line).width)
        );
        const edgePadding = creatureWidth / 2 + 16;
        const leftEdge = edgePadding;
        const rightEdge = Math.max(leftEdge, canvasWidth - edgePadding);
        const cycleDuration = flipAtEdges
            ? (duration + turnDuration) * 2
            : duration * 2;
        const cycleTime = reduceMotion
            ? duration / 2
            : (time + phaseOffset) % cycleDuration;
        let x = (leftEdge + rightEdge) / 2;
        let scaleX = -1;

        if (!flipAtEdges && cycleTime >= duration) {
            const progress = (cycleTime - duration) / duration;
            x = rightEdge - (rightEdge - leftEdge) * progress;
        } else if (cycleTime < duration) {
            const progress = cycleTime / duration;
            x = leftEdge + (rightEdge - leftEdge) * progress;
        } else if (cycleTime < duration + turnDuration) {
            const turnProgress = (cycleTime - duration) / turnDuration;
            x = rightEdge;
            scaleX = -Math.cos(turnProgress * Math.PI);
        } else if (cycleTime < duration * 2 + turnDuration) {
            const progress = (cycleTime - duration - turnDuration) / duration;
            x = rightEdge - (rightEdge - leftEdge) * progress;
            scaleX = 1;
        } else {
            const turnProgress = (cycleTime - duration * 2 - turnDuration) / turnDuration;
            x = leftEdge;
            scaleX = Math.cos(turnProgress * Math.PI);
        }

        const centerY = canvasHeight * verticalPosition
            + (reduceMotion ? 0 : Math.sin(time * bobSpeed + phaseOffset) * bobHeight);
        const startY = -blockHeight / 2 + fontSize;

        context.save();
        context.translate(x, centerY);
        context.scale(scaleX, 1);
        context.fillStyle = "lightgreen";
        context.textAlign = "left";
        context.textBaseline = "alphabetic";

        artwork.forEach((line, index) => {
            let characterX = -creatureWidth / 2;
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

        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        context.clearRect(0, 0, canvasWidth, canvasHeight);
        context.fillStyle = "#000";
        context.fillRect(0, 0, canvasWidth, canvasHeight);
        drawKelp(time);

        drawCreature({
            artwork: fish,
            time,
            duration: fishSwimDurations.fishOne,
            verticalPosition: 0.38,
            bobSpeed: 0.003,
            colorMap: fishOneCharacterColors,
            sizeScale: 1.3,
        });
        drawCreature({
            artwork: fishTwo,
            time,
            duration: fishSwimDurations.fishTwo,
            verticalPosition: 0.78,
            bobSpeed: 0.0023,
            colorMap: jellyfishCharacterColors,
            sizeScale: 0.8,
            phaseOffset: 6000,
            flipAtEdges: false,
        });
        drawCreature({
            artwork: fishThree,
            time,
            duration: fishSwimDurations.fishThree,
            verticalPosition: 0.58,
            bobSpeed: 0.0026,
            colorMap: fishThreeCharacterColors,
            phaseOffset: 11000,
        });
        drawCreature({
            artwork: fishFour,
            time,
            duration: fishSwimDurations.fishFour,
            verticalPosition: 0.26,
            bobSpeed: 0.002,
            colorMap: fishFourCharacterColors,
            sizeScale: 0.9,
            phaseOffset: 15000,
        });
        drawBubbles(time);
        drawWaterSurface();

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

    window.addEventListener("resize", queueDrawFish);
    animationFrame = requestAnimationFrame(drawFish);

    return () => {
        cancelAnimationFrame(animationFrame);
        window.removeEventListener("resize", queueDrawFish);
    };
};
