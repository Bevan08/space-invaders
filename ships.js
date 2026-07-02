const shipGrid =
document.getElementById("shipGrid");

const confirmBtn =
document.getElementById("confirmBtn");

const backBtn =
document.getElementById("backBtn");

let selectedShip = null;

const ships = [

"assets/player/playerShip1_blue.png",
"assets/player/playerShip1_green.png",
"assets/player/playerShip1_orange.png",
"assets/player/playerShip1_red.png",

"assets/player/playerShip2_blue.png",
"assets/player/playerShip2_green.png",
"assets/player/playerShip2_orange.png",
"assets/player/playerShip2_red.png",

"assets/player/playerShip3_blue.png",
"assets/player/playerShip3_green.png",
"assets/player/playerShip3_orange.png",
"assets/player/playerShip3_red.png"

];

ships.forEach(ship => {

    const card =
    document.createElement("div");

    card.classList.add("ship-card");

    card.innerHTML = `
        <img src="${ship}">
    `;

    card.addEventListener("click", () => {

        document
        .querySelectorAll(".ship-card")
        .forEach(card =>
            card.classList.remove("selected")
        );

        card.classList.add("selected");

        selectedShip = ship;
    });

    shipGrid.appendChild(card);
});

confirmBtn.addEventListener("click", () => {

    if(!selectedShip){

        alert("Select a ship first!");

        return;
    }

    localStorage.setItem(
        "selectedShip",
        selectedShip
    );

    window.location.href =
    "index.html";
});

backBtn.addEventListener("click", () => {

    window.location.href =
    "index.html";
});