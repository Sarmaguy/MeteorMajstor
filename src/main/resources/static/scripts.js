var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

// Postavljanje dimenzija Canvasa
canvas.width = window.innerWidth - 40;
canvas.height = window.innerHeight - 40;

//Svojstva igrača
var rectWidth = 100;
var rectHeight = 100;
var rectX = (canvas.width - rectWidth) / 2; //Postavljanje igrača na sredinu
var rectY = (canvas.height - rectHeight) / 2;
var rectSpeed = 10;

var meteors = []; // Kolekcija meteora
var collisionDetected = false;
var startTime, currentTime, bestTime;

var keys = {}; // Kolekcija pritisnutih tipki

// Broj meteora
var numberOfMeteors = 10;

// Stvaranje meteora
for (var i = 0; i < numberOfMeteors; i++) {
    meteors.push(newMeteor());
}

// Prvo crtanje objekata
drawObjects();
startTime = new Date().getTime(); //Postavljanje vremena na trenutno vrijeme

// Učitavanje najboljeg vremena iz local storagea
bestTime = parseFloat(localStorage.getItem("bestTime")) || null;

update();

// Prikazivanje najboljeg vremena kad se otvori stranica
displayBestTime();

// Funkcija koja crta objekte
function drawObjects() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.shadowBlur = 5;
    ctx.shadowColor = "black";


    // Igrac
    ctx.fillStyle = "red";
    ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
    ctx.strokeStyle = "black";
    ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);


    // Meteori
    ctx.fillStyle = "gray";
    meteors.forEach(function(meteor) {
        ctx.fillRect(meteor.x, meteor.y, meteor.width, meteor.height);
        ctx.strokeRect(meteor.x, meteor.y, meteor.width, meteor.height);
    });
}

// Funkcija za ponovno pokretanje igre
function restartGame() {
    collisionDetected = false;
    var gameOverMessage = document.getElementById("gameOverMessage");
    gameOverMessage.style.display = "none";

    // Postavljanje igrača na sredinu
    rectX = (canvas.width - rectWidth) / 2;
    rectY = (canvas.height - rectHeight) / 2;

    startTime = new Date().getTime();

    //Ponobno postavljanje meteora
    meteors.forEach(function(meteor) {
        resetMeteor(meteor);
    });

    update();
}

// Dodavanje key listenera
window.addEventListener("keydown", keyDownHandler);

window.addEventListener("keyup", function(event) {
    keys[event.key] = false;
});

function keyDownHandler(event) {
    keys[event.key] = true;
    //Ako je igra zavrsila i pritisnuli smo Enter, ponovno pokreni igru
    if (collisionDetected && event.key === "Enter") {
        restartGame();
    }
}


// Ponovno iscrtavanje Canvasa
function update() {
    if (collisionDetected) return; // Ako se dogodila kolizija, zaustavi igru


    // upravljanje igracem
    if (keys["ArrowLeft"]) rectX -= rectSpeed;
    if (keys["ArrowRight"]) rectX += rectSpeed;
    if (keys["ArrowUp"]) rectY -= rectSpeed;
    if (keys["ArrowDown"]) rectY += rectSpeed;

    // Micanje meteora
    for (var i = 0; i < meteors.length; i++) {
        var meteor = meteors[i];
        meteor.x += meteor.speedX;
        meteor.y += meteor.speedY;

        // Resetiranje meteora koji izađu izvan Canvasa
        if (meteor.x > canvas.width || meteor.x < -meteor.width || meteor.y > canvas.height || meteor.y < -meteor.height) {
            resetMeteor(meteor);
        }
    }

    // Prikazivanje vremena
    currentTime = new Date().getTime();
    var elapsedTime = (currentTime - startTime) / 1000;
    displayTime(elapsedTime);

    checkCollision(); // Provjera kolizije

    drawObjects(); // Ponovno crtanje objekata



    requestAnimationFrame(update); // Ponovno pokretanje update funkcije, daje "smooth" prijelaz između slika
}

// Funkcija za stvaranje novog meteora
function resetMeteor(meteor) {
    meteor.width = Math.random() * 70 + 40; // Veličina meteora je random broj između 40 i 110
    meteor.height = meteor.width;


    meteor.speedX = Math.random() * 8 + 4; // brzinu meteora je random broj između 4 i 12 na x osi
    meteor.speedY = (Math.random() - 0.5) * 4; // brzinu meteora je random broj između -2 i 2 na y osi

    // Određivanje strane s koje će meteor krenuti
    var side = Math.floor(Math.random() * 4);

    if (side === 0) {
        // Gore
        meteor.x = Math.random() * canvas.width;
        meteor.y = -meteor.height;
    } else if (side === 1) {
        // Dolje
        meteor.x = Math.random() * canvas.width;
        meteor.y = canvas.height;
        meteor.speedY = -Math.abs(meteor.speedY);
    } else if (side === 2) {
        // Lijevo
        meteor.x = -meteor.width;
        meteor.y = Math.random() * canvas.height;
    } else {
        // Desno
        meteor.x = canvas.width;
        meteor.y = Math.random() * canvas.height;
        meteor.speedX = -Math.abs(meteor.speedX);
    }

    // Ako je meteor izvan Canvasa, ponovno ga postavi
    if (meteor.x > canvas.width || meteor.x < -meteor.width) {
        resetMeteor(meteor);
    }
}

// Funkcija za stvaranje novog meteora
function newMeteor() {
    var meteor = {};
    resetMeteor(meteor);
    return meteor;
}

// Provjeri je li došlo do kolizije
function checkCollision() {
    for (var i = 0; i < meteors.length; i++) {
        var meteor = meteors[i];

        if (
            rectX < meteor.x + meteor.width &&
            rectX + rectWidth > meteor.x &&
            rectY < meteor.y + meteor.height &&
            rectY + rectHeight > meteor.y
        ) {

            // Ako je igrač prešao najbolje vrijeme, spremi novo najbolje vrijeme
            if (!bestTime || currentTime - startTime > bestTime) {
                bestTime = currentTime - startTime;
                localStorage.setItem("bestTime", bestTime);
                displayBestTime();
            }

            // Zaustavi igru
            collisionDetected = true;
            showGameOverMessage();


            return;
        }
    }
}

// Prikaži poruku o kraju igre
function showGameOverMessage() {
    var gameOverMessage = document.getElementById("gameOverMessage");
    gameOverMessage.style.display = "block";
}

// Funkcija za prikazivanje vremena u formatu minute:sekunde:milisekunde
function displayTime(timeInSeconds) {
    var minutes = Math.floor(timeInSeconds / 60);
    var seconds = Math.floor(timeInSeconds % 60);
    var milliseconds = Math.floor((timeInSeconds % 1) * 1000);

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    milliseconds = milliseconds < 10 ? "00" + milliseconds : milliseconds < 100 ? "0" + milliseconds : milliseconds;

    var timeDisplay = document.getElementById("timeDisplay");
    timeDisplay.textContent = "Vrijeme: " + minutes + ":" + seconds + ":" + milliseconds;
}

// Funkcija za prikazivanje najboljeg vremena
function displayBestTime() {
    if (bestTime) {
        var bestTimeDisplay = document.getElementById("bestTimeDisplay");
        bestTimeDisplay.textContent = "Najbolje vrijeme: " + formatTime(bestTime / 1000);
    }
}


// Funkcija za formatiranje vremena u format minute:sekunde:milisekunde
function formatTime(timeInSeconds) {
    var minutes = Math.floor(timeInSeconds / 60);
    var seconds = Math.floor(timeInSeconds % 60);
    var milliseconds = Math.floor((timeInSeconds % 1) * 1000);


    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    milliseconds = milliseconds < 10 ? "00" + milliseconds : milliseconds < 100 ? "0" + milliseconds : milliseconds;

    return minutes + ":" + seconds + ":" + milliseconds;
}

