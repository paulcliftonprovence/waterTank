// Scale factor for tank size (1 = 100 liters)
let scaleFactor = 1; // Manually adjustable
let isAnimating = false; // Prevents multiple clicks during animation

// Get viewport size for dynamic canvas dimensions
const canvasWidth = Math.floor(window.innerWidth * 0.8);
const canvasHeight = Math.floor(window.innerHeight * 0.8);

// Initialize Fabric.js Canvas
const canvas = new fabric.Canvas('canvas', {
    width: canvasWidth,
    height: canvasHeight
});

// Base dimensions for the tank at scale 1 (100 liters)
const baseTankWidth = 250;
const baseTankHeight = 200;

// Function to calculate tank positioning
function getTankPosition(scale) {
    return {
        width: baseTankWidth * scale,
        height: baseTankHeight * scale,
        left: (canvasWidth - baseTankWidth * scale) / 2,
        top: (canvasHeight - baseTankHeight * scale) / 2
    };
}

// Create the water tank (Scalable)
const tankProps = getTankPosition(scaleFactor);
const tank = new fabric.Rect({
    ...tankProps,
    fill: 'lightgray',
    stroke: 'black',
    strokeWidth: 4,
    selectable: false
});

// Base pipe dimensions
const pipeWidth = 120;
const pipeHeight = 30;

// Function to calculate pipe positioning
function getPipePosition(tank) {
    return {
        left: tank.left + tank.width - 5, // Attach to top-right of tank
        top: tank.top + 15 // Slightly below the top edge
    };
}

// Create the pipe border (stays green)
const pipeProps = getPipePosition(tank);
const pipe = new fabric.Rect({
    ...pipeProps,
    width: pipeWidth,
    height: pipeHeight,
    fill: 'lightgreen', // Pipe border
    stroke: 'darkgreen',
    strokeWidth: 4,
    selectable: false
});

// Initially, the pipe inside is empty (same color as the border)
const waterPipe = new fabric.Rect({
    left: pipe.left + pipe.width - 4, // Start filling from the right
    top: pipe.top + 2,
    width: 0, // Initially empty
    height: pipe.height - 4,
    fill: 'blue',
    selectable: false
});

// Water running down the side (Starts at pipe height, falls down)
const waterFallStartY = pipe.top + pipeHeight;
const waterFallMaxHeight = tank.height - (waterFallStartY - tank.top);

const waterSide = new fabric.Rect({
    left: tank.left + tank.width * 0.95,
    top: waterFallStartY, // Starts at pipe height
    width: tank.width * 0.05,
    height: 0, // Starts at 0, will animate down
    fill: 'blue',
    selectable: false
});

// Water filling inside the tank (Bottom to top)
const waterTank = new fabric.Rect({
    left: tank.left + 2,
    top: tank.top + tank.height,
    width: tank.width - 4,
    height: 0, // Starts empty
    fill: 'blue',
    selectable: false
});

// Button to control animation
const buttonBackground = new fabric.Rect({
    left: tank.left - 150,
    top: tank.top + tank.height / 2 - 30,
    width: 120,
    height: 60,
    fill: 'gray',
    stroke: 'black',
    strokeWidth: 2,
    selectable: false
});

const buttonCircle = new fabric.Circle({
    left: buttonBackground.left + 30,
    top: buttonBackground.top + 15,
    radius: 15,
    fill: 'red',
    selectable: false
});

const buttonText = new fabric.Text("Flow OFF", {
    left: buttonBackground.left + 60,
    top: buttonBackground.top + 40,
    fontSize: 16,
    fontWeight: "bold",
    fill: "black",
    selectable: false,
    originX: "center"
});

// Function to animate water flowing inside the pipe from right to left
function fillPipeAnimation(duration, callback) {
    waterPipe.animate(
        { width: pipe.width, left: pipe.left },
        { duration, onChange: canvas.renderAll.bind(canvas), onComplete: callback }
    );
}

// Function to animate water filling the tank
function fillTankAnimation() {
    if (isAnimating) return;
    isAnimating = true;

    // Disable button during animation
    buttonBackground.set({ fill: "darkgray" });
    canvas.renderAll();

    // Step 1: Pipe fills with water
    fillPipeAnimation(1000, () => {
        // Step 2: Water runs down the side of the tank (starting from pipe height!)
        waterSide.animate(
            { height: waterFallMaxHeight }, // Now correctly stops at the tank bottom
            {
                duration: 1000,
                onChange: canvas.renderAll.bind(canvas),
                onComplete: () => {
                    // Step 3: Fill the tank from the bottom up
                    waterTank.animate(
                        { top: tank.top, height: tank.height },
                        {
                            duration: 2000,
                            onChange: canvas.renderAll.bind(canvas),
                            onComplete: () => {
                                isAnimating = false;
                                buttonBackground.set({ fill: "gray" });
                                canvas.renderAll();
                            }
                        }
                    );
                }
            }
        );
    });
}

// Function to handle button click
function toggleFlow() {
    if (isAnimating) return;

    if (buttonText.text === "Flow OFF") {
        buttonText.set({ text: "Flow ON" });
        fillTankAnimation();
    } else {
        buttonText.set({ text: "Flow OFF" });
    }

    canvas.renderAll();
}

// Make button clickable
buttonBackground.on("mousedown", toggleFlow);
buttonCircle.on("mousedown", toggleFlow);

// Add elements to canvas
canvas.add(tank, pipe, waterPipe, waterSide, waterTank);
canvas.add(buttonBackground, buttonCircle, buttonText);
