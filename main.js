let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

let birdWidth = 34;
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 3;
let birdImg;


// bird
let bird = {
    img: birdImg,
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
}

// pipe
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

// physics
let velocityX = -2; // for pipe
let velocityY = 0; // for bird jump speed
let gravity = 0.2;
if (window.innerWidth < 768) {
    gravity = 0.15;
}

let gameOver = false;
let intervalId = null;

let score = 0;

// set up board
board = document.getElementById("board");
board.height = boardHeight;
board.width = boardWidth;

context = board.getContext("2d"); // this context use for drawing
context.fillStyle = "white";

context.font = "12px 'Press Start 2P', cursive"
context.fillText("Press any key to start", 50, 320)


document.addEventListener("keydown", startGame);
board.addEventListener("mousedown", startGame);
board.addEventListener("touchstart", startGame);

// set up function change character
const characterStorage = [
    "./images/flappybird.png",
    "./images/baroibeo.png",
    "./images/1.png",
    "./images/2.png",
    "./images/mario.png",
    "./images/3.png",
    "./images/4.png",
    "./images/luffy.png"
];

let characterButton = document.querySelector(".change-character");
let imgSrc = characterStorage[0];

characterButton.addEventListener("click", function() {
    currentCharacterIndex = (currentCharacterIndex + 1) % characterStorage.length;
});

let currentCharacterIndex = 0;

function changeCharacter() {

    imgSrc = characterStorage[currentCharacterIndex];

    if (imgSrc !== "./images/flappybird.png") {
        bird.height = 34;
    } else {
        bird.height = 24;
    }
    birdImg = new Image();
    birdImg.src = imgSrc
    birdImg.onload = function() {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height)
    }
}


function startGame() {
    pipeArray = [];
    velocityY = 0;
    velocityX = -2;
    score = 0;
    bird.x = birdX;
    bird.y = birdY;

    context.clearRect(0, 0, board.width, board.height);

    // set img for bird
    changeCharacter();

    // set img for pipe
    topPipeImg = new Image();
    topPipeImg.src = "./images/toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./images/bottompipe.png";

    document.removeEventListener("keydown", startGame);
    board.removeEventListener("mousedown", startGame);
    board.removeEventListener("touchstart", startGame);

    document.addEventListener("keydown", moveBird);
    board.addEventListener("mousedown", moveBird);
    board.addEventListener("touchstart", moveBird);
    gameOver = false;
    requestAnimationFrame(update);
    clearInterval(intervalId);
    intervalId = setInterval(placePipes, 1800);
}

function update() {

    if (gameOver) {
        context.fillText("Game Over", 50, 300)
        context.font = "10px 'Press Start 2P', cursive"
        context.fillText("Press any key to continue", 58, 320)

        document.addEventListener("keydown", startGame);
        board.addEventListener("mousedown", startGame);
        board.addEventListener("touchstart", startGame);

        document.removeEventListener("keydown", moveBird);
        board.removeEventListener("mousedown", moveBird);
        board.removeEventListener("touchstart", moveBird);
        return;
    }
    requestAnimationFrame(update);
    context.clearRect(0, 0, board.width, board.height); // clear old frame to update another frame

    //draw bird again
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0);
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    if (bird.y > board.height) {
        gameOver = true;
    }

    // pipes update
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height)

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5;
            pipe.passed = true;
        }
        if (checkWin(bird, pipe)) {
            gameOver = true;
        }
    }

    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); // remove first element
    }

    //update score
    context.font = "30px 'Press Start 2P', cursive"
    context.fillText(score, 10, 40);

}

function placePipes() {
    if (gameOver) {
        return;
    }

    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 4.2; // set space between pipes that bird can fly through

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }

    pipeArray.push(topPipe)

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }

    pipeArray.push(bottomPipe)

}

function moveBird(e) {
    if (e.code == 'Space' || e.code == "ArrowUp" || e.type == "mousedown") { // jump function
        velocityY = -6;
    }
}

function checkWin(bird, pipe) {
    const birdLeft = bird.x;
    const birdRight = bird.x + bird.width;
    const birdTop = bird.y;
    const birdBottom = bird.y + bird.height;

    const pipeLeft = pipe.x;
    const pipeRight = pipe.x + pipe.width;
    const pipeTop = pipe.y;
    const pipeBottom = pipe.y + pipe.height;

    return birdLeft < pipeRight && // check left side of bird is to the left of right side of pipe
        birdRight > pipeLeft && // check right side of bird is to the right left side of pipe
        birdTop < pipeBottom && // check top of bird is above the bottom of pipe
        birdBottom > pipeTop; // check bottom of bird is is below the top of pipe
}

// Disable right-click
document.addEventListener('contextmenu', (e) => e.preventDefault());

function ctrlShiftKey(e, keyCode) {
    return e.ctrlKey && e.shiftKey && e.keyCode === keyCode.charCodeAt(0);
}

document.onkeydown = (e) => {
    // Disable F12, Ctrl + Shift + I, Ctrl + Shift + J, Ctrl + U
    if (
        event.keyCode === 123 ||
        ctrlShiftKey(e, 'I') ||
        ctrlShiftKey(e, 'J') ||
        ctrlShiftKey(e, 'C') ||
        (e.ctrlKey && e.keyCode === 'U'.charCodeAt(0))
    )
        return false;
};
