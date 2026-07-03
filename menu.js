const shipPreview =
document.getElementById(
    "selectedShipPreview"
);

const savedShip =
localStorage.getItem(
    "selectedShip"
);

if(savedShip){

    shipPreview.src =
    savedShip;

}else{

    shipPreview.src =
    "assets/player/playerShip1_blue.png";
}

const playBtn = document.getElementById("playBtn");
const shipBtn = document.getElementById("shipBtn");
const scoreBtn = document.getElementById("scoreBtn");

playBtn.addEventListener("click", () => {

    const selectedShip =
    localStorage.getItem("selectedShip");

    if(!selectedShip){

        alert("Choose a spacecraft first!");

        return;
    }

    window.location.href = "game.html";
});

shipBtn.addEventListener("click", () => {
    window.location.href = "ships.html";
});

scoreBtn.addEventListener("click", () => {
    alert("Scoreboard coming soon");
});

// =============================
// ROTATE SCREEN
// =============================

function checkOrientation() {

    const overlay =

        document.getElementById("rotateOverlay");

    const isMobile =

        window.innerWidth <= 900;

    const isPortrait =

        window.innerHeight >

        window.innerWidth;

    if (

        isMobile &&

        isPortrait

    ) {

        overlay.style.display = "flex";

    }

    else {

        overlay.style.display = "none";

    }

}

checkOrientation();

window.addEventListener(

    "resize",

    checkOrientation

);