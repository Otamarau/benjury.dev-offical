let canvas = null;
let context = null;
const sampleCanvas = document.createElement("canvas");
const sampleContext = sampleCanvas.getContext("2d", {
    willReadFrequently: true,
});

const NAME = "benjury.dev";
const CHARACTERS = ["@", "$", "#", "%", "!", "&", "*"];
const points = [];
const characterAtlas = document.createElement("canvas");
const spriteSize = 12;
const shadeCount = 5;
const frameInterval = 1000 / 60;
const physicsInterval = 1000 / 30;
const cameraDistance = 900;
const dragSensitivity = 0.01;
const friction = 0.95;
const maxVelocity = 0.006;
const returnStrength = 0.000012;
const restThreshold = 0.0004;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const wobblePitch = 0.035;
const wobbleYaw = 0.02;
const wobbleRoll = 0.045;
const introDuration = 2200;
const introScatterWidth = 1200;
const introScatterHeight = 520;
const introScatterDepth = 1100;

let width = 0;
let height = 0;
let layoutWidth = 0;
let layoutHeight = 0;
let modelRadius = 0;
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
let introStartTime = 0;

const easeOutCubic = (value) => {
    return 1 - Math.pow(1 - value, 3);
};

const buildCharacterSprites = () => {
    const colors = ["#277a27", "#3e9f3e", "#58c758", "#78e878", "#a2f5a2"];
    characterAtlas.width = CHARACTERS.length * spriteSize;
    characterAtlas.height = colors.length * spriteSize;
    const spriteContext = characterAtlas.getContext("2d");
    spriteContext.font = "10px Consolas, monospace";
    spriteContext.textAlign = "center";
    spriteContext.textBaseline = "middle";

    for (let characterIndex = 0; characterIndex < CHARACTERS.length; characterIndex += 1) {
        for (let shade = 0; shade < colors.length; shade += 1) {
            spriteContext.fillStyle = colors[shade];
            spriteContext.fillText(
                CHARACTERS[characterIndex],
                characterIndex * spriteSize + spriteSize / 2,
                shade * spriteSize + spriteSize / 2
            );
        }
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
    modelRadius = 0;
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
            const targetX = surfacePoint.x - centerX;
            const targetY = surfacePoint.y - centerY;
            const targetZ = (depthPosition - 0.5) * depth;
            modelRadius = Math.max(modelRadius, Math.hypot(targetX, targetY, targetZ));
            const scatterAngle = depthJitter * Math.PI * 2;
            const scatterSeed = Math.sin(
                surfacePoint.x * 93.9898
                + surfacePoint.y * 67.345
                + layer * 21.129
            ) * 18421.7273;
            const scatterNoise = scatterSeed - Math.floor(scatterSeed);
            const scatterXSeed = Math.sin(seed * 0.017 + surfacePoint.y * 1.371) * 8743.123;
            const scatterYSeed = Math.sin(seed * 0.023 + surfacePoint.x * 1.917) * 6591.784;
            const scatterZSeed = Math.sin(seed * 0.031 + layer * 4.731) * 2931.417;
            const scatterRadius = 360 + scatterNoise * 440;

            points.push({
                x: targetX,
                y: targetY,
                z: targetZ,
                startX: Math.cos(scatterAngle) * scatterRadius
                    + ((scatterXSeed - Math.floor(scatterXSeed)) - 0.5) * introScatterWidth,
                startY: Math.sin(scatterAngle) * scatterRadius
                    + ((scatterYSeed - Math.floor(scatterYSeed)) - 0.5) * introScatterHeight,
                startZ: ((scatterZSeed - Math.floor(scatterZSeed)) - 0.5) * introScatterDepth,
                spriteX: characterIndex * spriteSize,
            });
        }
    }
};

const resizeCanvas = () => {
    if (!canvas) {
        return;
    }

    const bounds = canvas.getBoundingClientRect();
    const layoutBounds = canvas.parentElement.getBoundingClientRect();
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    width = bounds.width;
    height = bounds.height;
    layoutWidth = layoutBounds.width;
    layoutHeight = layoutBounds.height;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
};

const draw = (time) => {
    if (!canvas || !context) {
        return;
    }

    animationFrame = requestAnimationFrame(draw);

    const elapsed = time - lastDrawTime;

    // Allow timestamp rounding, and carry the remainder to avoid skipped refreshes.
    if (elapsed < frameInterval - 0.5) {
        return;
    }

    const deltaTime = Math.min(time - previousTime, 50);
    previousTime = time;
    lastDrawTime += frameInterval * Math.max(1, Math.floor((elapsed + 0.5) / frameInterval));

    if (!isDragging) {
        velocityX += -angleX * returnStrength * deltaTime;
        velocityY += -angleY * returnStrength * deltaTime;
        angleX += velocityX * deltaTime;
        angleY += velocityY * deltaTime;
        const damping = Math.pow(friction, deltaTime / physicsInterval);
        velocityX *= damping;
        velocityY *= damping;

        if (Math.abs(angleX) < restThreshold && Math.abs(velocityX) < 0.00001) {
            angleX = 0;
            velocityX = 0;
        }

        if (Math.abs(angleY) < restThreshold && Math.abs(velocityY) < 0.00001) {
            angleY = 0;
            velocityY = 0;
        }
    }

    // A sphere enclosing the name bounds its perspective width at every rotation.
    // Reserve half the largest character size at both edges as well.
    const projectedRadius = modelRadius * cameraDistance
        / Math.sqrt(cameraDistance * cameraDistance - modelRadius * modelRadius);
    // Keep the assembled name fitted to the content area while particles use the viewport.
    const horizontalScale = Math.max(0, layoutWidth * 0.92 - 11)
        / Math.max(2 * projectedRadius, 1);
    const verticalScale = (layoutHeight * 0.72) / Math.max(modelHeight, 1);
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
    const introElapsed = reduceMotion ? introDuration : time - introStartTime;
    const introProgress = easeOutCubic(Math.min(Math.max(introElapsed / introDuration, 0), 1));
    const introComplete = introProgress === 1;

    // Compose the rotation once per frame instead of repeating it for every point.
    const xx = cosZ * cosY;
    const xy = -sinZ * cosY;
    const xz = -sinY;
    const yx = sinZ * cosX - cosZ * sinY * sinX;
    const yy = cosZ * cosX + sinZ * sinY * sinX;
    const yz = -cosY * sinX;
    const zx = sinZ * sinX + cosZ * sinY * cosX;
    const zy = cosZ * sinX - sinZ * sinY * cosX;
    const zz = cosY * cosX;

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.fillStyle = "#000";
    context.fillRect(0, 0, width, height);

    for (const point of points) {
        const pointX = introComplete ? point.x : point.startX + (point.x - point.startX) * introProgress;
        const pointY = introComplete ? point.y : point.startY + (point.y - point.startY) * introProgress;
        const pointZ = introComplete ? point.z : point.startZ + (point.z - point.startZ) * introProgress;
        const rotatedX = pointX * xx + pointY * xy + pointZ * xz;
        const rotatedY = pointX * yx + pointY * yy + pointZ * yz;
        const finalZ = pointX * zx + pointY * zy + pointZ * zz;
        const perspective = cameraDistance / (cameraDistance + finalZ);
        const size = Math.max(4.5, Math.min(11, 7.5 * baseScale * perspective));
        const spriteIndex = Math.max(
            0,
            Math.min(shadeCount - 1, Math.floor((80 - finalZ) / 40))
        );
        const x = centerX + rotatedX * baseScale * perspective;
        const y = centerY + rotatedY * baseScale * perspective;

        if (x + size / 2 < 0 || x - size / 2 > width
            || y + size / 2 < 0 || y - size / 2 > height) {
            continue;
        }

        context.drawImage(
            characterAtlas,
            point.spriteX,
            spriteIndex * spriteSize,
            spriteSize,
            spriteSize,
            x - size / 2,
            y - size / 2,
            size,
            size
        );
    }
};

const startAnimation = () => {
    cancelAnimationFrame(animationFrame);
    if (points.length === 0) {
        buildCharacterSprites();
        buildNamePoints();
    }
    resizeCanvas();
    previousTime = performance.now();
    lastDrawTime = previousTime;
    angleX = 0;
    angleY = 0;
    velocityX = 0;
    velocityY = 0;
    isDragging = false;
    introStartTime = previousTime;
    animationFrame = requestAnimationFrame(draw);
};

const startDragging = (event) => {
    isDragging = true;
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
    lastPointerTime = performance.now();
    velocityX = 0;
    velocityY = 0;
    canvas?.setPointerCapture(event.pointerId);
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

    if (canvas?.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
    }
};

const setupCanvas = () => {
    canvas = document.getElementById("ascii-name");

    if (!canvas) {
        return null;
    }

    context = canvas.getContext("2d", { alpha: false });

    window.addEventListener("resize", resizeCanvas);
    canvas.addEventListener("pointerdown", startDragging);
    canvas.addEventListener("pointermove", dragName);
    canvas.addEventListener("pointerup", stopDragging);
    canvas.addEventListener("pointercancel", stopDragging);

    startAnimation();

    return () => {
        cancelAnimationFrame(animationFrame);
        window.removeEventListener("resize", resizeCanvas);
        canvas?.removeEventListener("pointerdown", startDragging);
        canvas?.removeEventListener("pointermove", dragName);
        canvas?.removeEventListener("pointerup", stopDragging);
        canvas?.removeEventListener("pointercancel", stopDragging);
        canvas = null;
        context = null;
    };
};
