//board
let board;
// --- UBAH: Gunakan window size ---
let boardWidth = window.innerWidth; 
let boardHeight = window.innerHeight;
let context;

//bird
let birdWidth = 120;
let birdHeight = 80;

// UBAH BAGIAN INI:
// X = (Setengah Layar) - (Setengah Lebar Burung)
let birdX = (boardWidth / 2) - (birdWidth / 2); 
let birdY = boardHeight / 2;
let birdImg;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
}

//pipes
let pipeArray = [];
let pipeWidth = 128;
let pipeHeight = 512;
// --- UBAH: pipeX jangan fix di awal, tapi nanti diambil dari boardWidth saat spawn ---
let pipeX = boardWidth; 
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
let velocityX = -2;
let velocityY = 0;
let gravity = 0.15;

let gameOver = false;
let score = 0;

// --- UBAH: Variabel pengaturan jarak pipa ---
let pipeSpawnRate = 3500; // Ubah ke 2000 untuk lebih jauh, 1000 untuk lebih dekat
let spawnTimer;

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    //load images
    birdImg = new Image();
    birdImg.src = "./c2.png";
    birdImg.onload = function() {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    topPipeImg = new Image();
    topPipeImg.src = "./Boxup.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./Boxbot.png";

    requestAnimationFrame(update);
    
    // --- UBAH: Gunakan variabel pipeSpawnRate ---
    spawnTimer = setInterval(placePipes, pipeSpawnRate);

    document.addEventListener("keydown", moveBird);
    document.addEventListener("click", moveBird);
    
    // --- UBAH: Fitur Resize agar responsif saat layar diputar/diubah ---
    window.addEventListener('resize', function() {
        boardWidth = window.innerWidth;
        boardHeight = window.innerHeight;
        board.width = boardWidth;
        board.height = boardHeight;

        // TAMBAHAN: Paksa burung kembali ke tengah saat layar berubah ukuran
        bird.x = (boardWidth / 2) - (birdWidth / 2);
    });
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    //bird
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0);
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
    }

    //pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5;
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    //clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift();
    }

    //score
    context.fillStyle = "white";
    context.font = "45px Copasetic";
    context.fillText(score, 5, 45);
    
    if (gameOver) {
        let prevAlign = context.textAlign;
        context.textAlign = "center";
        context.fillText("GAME OVER", boardWidth / 2, boardHeight / 2);
        context.textAlign = prevAlign;
    }
}

function placePipes() {
    if (gameOver) {
        return;
    }

    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 2; // Sedikit disesuaikan agar proporsional di layar berbeda

    // --- UBAH: Gunakan boardWidth saat ini sebagai posisi X spawn ---
    let currentPipeX = boardWidth; 

    let topPipe = {
        img: topPipeImg,
        x: currentPipeX, // Pakai currentPipeX
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: currentPipeX, // Pakai currentPipeX
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    if (e.type == "click" || e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        velocityY = -6;

        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
            
            // Opsional: Reset timer pipa supaya sinkron saat restart
            clearInterval(spawnTimer);
            spawnTimer = setInterval(placePipes, pipeSpawnRate);
        }
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}