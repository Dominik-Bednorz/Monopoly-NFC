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
        if (gameMode === "waiting_for_players") {
            debug(invite_Players(nfcID));

        }
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
let bankdiv_text;

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

        text = `${gameState.get(id).name}: ${gameState.get(id).geld}$\n`;
    };

   

    bankdiv.innerText = bankdiv_text;
    document.getElementById(bankdiv).appendChild(bankdiv);
});

function debug(msg) { //statt Console
    document.getElementById("debug").innerText += msg + "\n";
};

console.log()