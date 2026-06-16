const canvas = document.getElementById("ascii-name");
const context = canvas.getContext("2d");
const sampleCanvas = document.createElement("canvas");
const sampleContext = sampleCanvas.getContext("2d", {
    willReadFrequently: true,
});

const NAME = "benjury.dev";
const CHARACTERS = ["@", "$", "#", "%", "!", "&", "*"];
const points = [];
const characterSprites = [];
const frameInterval = 1000 / 30;
const dragSensitivity = 0.01;
const friction = 0.95;
const maxVelocity = 0.006;
const returnStrength = 0.000012;
const restThreshold = 0.0004;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const wobblePitch = 0.035;
const wobbleYaw = 0.02;
const wobbleRoll = 0.045;

let width = 0;
let height = 0;
let modelWidth = 0;
let modelHeight = 0;
let pixelRatio = 1;
let animationFrame = 0;
let previousTime = performance.now();
let lastDrawTime = 0;
let angleX = 0;
let angleY = 0;
let velocityX = 0;
let velocityY = 0;
let isDragging = false;
let lastPointerX = 0;
let lastPointerY = 0;
let lastPointerTime = performance.now();

const buildCharacterSprites = () => {
    const colors = ["#277a27", "#3e9f3e", "#58c758", "#78e878", "#a2f5a2"];

    characterSprites.length = 0;

    for (const character of CHARACTERS) {
        const shades = [];

        for (const color of colors) {
            const sprite = document.createElement("canvas");
            const spriteContext = sprite.getContext("2d");

            sprite.width = 12;
            sprite.height = 12;
            spriteContext.fillStyle = color;
            spriteContext.font = "10px Consolas, monospace";
            spriteContext.textAlign = "center";
            spriteContext.textBaseline = "middle";
            spriteContext.fillText(character, 6, 6);
            shades.push(sprite);
        }

        characterSprites.push(shades);
    }
};

const buildNamePoints = () => {
    const fontSize = 150;
    const sampleStep = 8;
    const depthLayers = 5;
    const depth = 50;
    const surfacePoints = [];

    sampleContext.font = `900 ${fontSize}px Consolas, monospace`;
    const textWidth = Math.ceil(sampleContext.measureText(NAME).width);

    sampleCanvas.width = textWidth + 20;
    sampleCanvas.height = fontSize + 40;

    sampleContext.clearRect(0, 0, sampleCanvas.width, sampleCanvas.height);
    sampleContext.fillStyle = "#fff";
    sampleContext.font = `900 ${fontSize}px Consolas, monospace`;
    sampleContext.textBaseline = "top";
    sampleContext.fillText(NAME, 10, 0);

    const imageData = sampleContext.getImageData(
        0,
        0,
        sampleCanvas.width,
        sampleCanvas.height
    ).data;
    let minX = sampleCanvas.width;
    let maxX = 0;
    let minY = sampleCanvas.height;
    let maxY = 0;

    points.length = 0;

    for (let y = 0; y < sampleCanvas.height; y += sampleStep) {
        for (let x = 0; x < sampleCanvas.width; x += sampleStep) {
            const alpha = imageData[(y * sampleCanvas.width + x) * 4 + 3];

            if (alpha < 100) {
                continue;
            }

            surfacePoints.push({ x, y });
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        }
    }

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    modelWidth = maxX - minX + sampleStep;
    modelHeight = maxY - minY + sampleStep;

    for (const surfacePoint of surfacePoints) {
        for (let layer = 0; layer < depthLayers; layer += 1) {
            const seed = Math.sin(
                surfacePoint.x * 12.9898
                + surfacePoint.y * 78.233
                + layer * 37.719
            ) * 43758.5453;
            const depthJitter = seed - Math.floor(seed);
            const depthPosition = (layer + depthJitter) / depthLayers;
            const characterIndex = Math.floor(depthJitter * CHARACTERS.length);

            points.push({
                x: surfacePoint.x - centerX,
                y: surfacePoint.y - centerY,
                z: (depthPosition - 0.5) * depth,
                characterIndex,
            });
        }
    }
};

const resizeCanvas = () => {
    const bounds = canvas.getBoundingClientRect();
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    width = bounds.width;
    height = bounds.height;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
};

const draw = (time) => {
    animationFrame = requestAnimationFrame(draw);

    if (time - lastDrawTime < frameInterval) {
        return;
    }

    const deltaTime = Math.min(time - previousTime, 50);
    previousTime = time;
    lastDrawTime = time;

    if (!isDragging) {
        velocityX += -angleX * returnStrength * deltaTime;
        velocityY += -angleY * returnStrength * deltaTime;
        angleX += velocityX * deltaTime;
        angleY += velocityY * deltaTime;
        velocityX *= friction;
        velocityY *= friction;

        if (Math.abs(angleX) < restThreshold && Math.abs(velocityX) < 0.00001) {
            angleX = 0;
            velocityX = 0;
        }

        if (Math.abs(angleY) < restThreshold && Math.abs(velocityY) < 0.00001) {
            angleY = 0;
            velocityY = 0;
        }
    }

    const cameraDistance = 900;
    const horizontalScale = (width * 0.92) / modelWidth;
    const verticalScale = (height * 0.72) / Math.max(modelHeight, 1);
    const baseScale = Math.min(horizontalScale, verticalScale);
    const wobbleTime = time * 0.001;
    const wobbleAmount = !isDragging && !reduceMotion ? 1 : 0;
    const displayAngleX = angleX + Math.sin(wobbleTime * 0.9) * wobblePitch * wobbleAmount;
    const displayAngleY = angleY + Math.sin(wobbleTime * 0.63 + 1.7) * wobbleYaw * wobbleAmount;
    const displayAngleZ = Math.sin(wobbleTime * 0.74 + 0.8) * wobbleRoll * wobbleAmount;
    const cosY = Math.cos(displayAngleY);
    const sinY = Math.sin(displayAngleY);
    const cosX = Math.cos(displayAngleX);
    const sinX = Math.sin(displayAngleX);
    const cosZ = Math.cos(displayAngleZ);
    const sinZ = Math.sin(displayAngleZ);
    const centerX = width / 2;
    const centerY = height / 2;

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, width, height);
    context.fillStyle = "#000";
    context.fillRect(0, 0, width, height);

    for (const point of points) {
        const rolledX = point.x * cosZ - point.y * sinZ;
        const rolledY = point.x * sinZ + point.y * cosZ;
        const rotatedX = rolledX * cosY - point.z * sinY;
        const rotatedZ = rolledX * sinY + point.z * cosY;
        const rotatedY = rolledY * cosX - rotatedZ * sinX;
        const finalZ = rolledY * sinX + rotatedZ * cosX;
        const perspective = cameraDistance / (cameraDistance + finalZ);
        const size = Math.max(4.5, Math.min(11, 7.5 * baseScale * perspective));
        const shades = characterSprites[point.characterIndex];
        const spriteIndex = Math.max(
            0,
            Math.min(shades.length - 1, Math.floor((80 - finalZ) / 40))
        );
        const x = centerX + rotatedX * baseScale * perspective;
        const y = centerY + rotatedY * baseScale * perspective;

        context.drawImage(
            shades[spriteIndex],
            x - size / 2,
            y - size / 2,
            size,
            size
        );
    }
};

const startAnimation = () => {
    cancelAnimationFrame(animationFrame);
    buildCharacterSprites();
    buildNamePoints();
    resizeCanvas();
    previousTime = performance.now();
    lastDrawTime = 0;
    animationFrame = requestAnimationFrame(draw);
};

const startDragging = (event) => {
    isDragging = true;
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
    lastPointerTime = performance.now();
    velocityX = 0;
    velocityY = 0;
    canvas.setPointerCapture(event.pointerId);
};

const dragName = (event) => {
    if (!isDragging) {
        return;
    }

    const movementX = event.clientX - lastPointerX;
    const movementY = event.clientY - lastPointerY;
    const now = performance.now();
    const elapsed = Math.max(now - lastPointerTime, 16);

    angleY += movementX * dragSensitivity;
    angleX += movementY * dragSensitivity;
    velocityY = Math.max(
        -maxVelocity,
        Math.min(maxVelocity, (movementX * dragSensitivity) / elapsed)
    );
    velocityX = Math.max(
        -maxVelocity,
        Math.min(maxVelocity, (movementY * dragSensitivity) / elapsed)
    );
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
    lastPointerTime = now;
};

const stopDragging = (event) => {
    if (!isDragging) {
        return;
    }

    isDragging = false;

    if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
    }
};

window.addEventListener("resize", resizeCanvas);
canvas.addEventListener("pointerdown", startDragging);
canvas.addEventListener("pointermove", dragName);
canvas.addEventListener("pointerup", stopDragging);
canvas.addEventListener("pointercancel", stopDragging);

startAnimation();
