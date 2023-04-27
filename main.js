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
let gravity = 0.3;

let gameOver = false;
let intervalId = null;

let score = 0;

// set up board
board = document.getElementById("board");
board.height = boardHeight;
board.width = boardWidth;
context = board.getContext("2d");
context.fillStyle = "white";
context.font = "12px 'Press Start 2P', cursive"
context.fillText("Press any key to start", 50, 320)


document.addEventListener("keydown", startGame);
board.addEventListener("mousedown", startGame);
board.addEventListener("touchstart", startGame);

function startGame() {
    pipeArray = [];
    velocityY = 0;
    velocityX = -2;
    score = 0;
    bird.x = birdX;
    bird.y = birdY;

    context.clearRect(0, 0, board.width, board.height);

    // set img for bird
    birdImg = new Image();
    birdImg.src = "./images/flappybird.png"
    birdImg.onload = function() {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height)
    }

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
    return bird.x < pipe.x + pipe.width &&
        bird.x + bird.width > pipe.x &&
        bird.y < pipe.y + pipe.height &&
        bird.y + bird.height > pipe.y;
}
