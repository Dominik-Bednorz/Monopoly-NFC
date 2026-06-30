let data;
async function init() {
    const response = await fetch("Datenbank.json");
    data = await response.json();
}

init();

const startgame = document.getElementById("playbutton"); //festlegung des Spielstart buttons

let gameMode = "waiting_for_players"

const ndef = new NDEFReader(); //Element das NFC ließt
let nfcID = ""; //Varibale für das Auslesen der Tags

document.getElementById("main").classList.add("invisible");//nur der Button ist sichtbar

startgame.addEventListener("click", async () => {
    document.getElementById("startgamescreen").classList.add("invisible");
    document.getElementById("main").classList.remove("invisible");

    await ndef.scan();

    ndef.onreading = ({ message }) => {
        const record = message.records[0];
        nfcID = Number(new TextDecoder().decode(record.data));

        debug(nfcID);
        debug("typ:" + data[nfcID]?.typ)

        const typ = data[nfcID]?.typ;

        switch (gameMode) {

            case "waiting_for_players":
                if (typ === "Spieler") {
                    debug(invite_Players(nfcID));
                }
                break;

            case "waiting_for_next_action":
                if (typ === "Feld") {
                    feldINFO(nfcID);
                    debug("Feld ist: " + nfcID);
                }
                break;

            case "waiting_for_payment":
                if (typ === "Spieler") {
                    pay(nfcID);
                    feldINFO_ausblenden();

                    debug("Spieler der zahlt: " + data[nfcID].name);
                    debug("Money: " + gameState.get(nfcID).geld);
                }
                break;
        };
    };
});

const beigetreteneSpieler = new Set();
const lobbyFertig = document.createElement("button");

function invite_Players(id) {

    if (beigetreteneSpieler.has(id)) {
        return data[id]?.name + " ist bereits beigetreten";
    }

    beigetreteneSpieler.add(id);

    document.getElementById(id)?.classList.remove("blinken");

    if (beigetreteneSpieler.size === 2) {
        lobbyFertig.textContent = "Alle Spieler da, starten";
        document.getElementById("main").appendChild(lobbyFertig);
    }

    return data[id]?.name + " ist beigetreten";
}

const gameState = new Map();
const bankdiv = document.createElement("div");
let bankdiv_text = "";

lobbyFertig.addEventListener("click", () => {
    lobbyFertig.classList.add("invisible");
    document.getElementById("lobby").classList.add("invisible");
    gameMode = "waiting_for_next_action";

    for(const id of beigetreteneSpieler) {
        gameState.set(id, {
            name: data[id].name,
            geld: 1500,
            grundstücke: []
        })
    };

    refresh_main();
    document.getElementById("main").appendChild(bankdiv);
});

let aktuelle_feld_id;

function feldINFO (id) {
    document.getElementById("feldINFO-popup").classList.remove("invisible");

    document.getElementById("feldINFO-popup-title").innerText = data[id]?.name;
    document.getElementById("feldINFO-popup-preis").innerText = data[id]?.preis;
    aktuelle_feld_id = id;
    gameMode = "waiting_for_payment";

};
    function feldINFO_ausblenden () {
        document.getElementById("feldINFO-popup").classList.add("invisible");
        gameMode = "waiting_for_next_action";
    };

function pay (id) {
    const player = gameState.get(id);
    const field = data[aktuelle_feld_id];

    player.geld -= field.preis;
    refresh_main();
};


function refresh_main () {
    bankdiv_text = "";

    for(const id of beigetreteneSpieler) {
        bankdiv_text += `${gameState.get(id).name}: ${gameState.get(id).geld}€\n`;
    };
    
    bankdiv.innerText = bankdiv_text;
};

function error_sound () {
    const error_audio = new Audio("./sounds/error.mp3");
    error_audio.play();
};


function debug(msg) { //statt Console
    document.getElementById("debug").innerText += msg + "\n";
};