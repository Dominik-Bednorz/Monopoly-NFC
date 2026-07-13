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
                if (typ === "Ereigniskarte") {
                    EreigniskarteINFO(nfcID);
                    debug("Ereigniskarte ist: " + nfcID);
                }
                break;

            case "waiting_for_payment":
                if (typ === "Spieler") {
                    pay(nfcID);
                    feldINFO_ausblenden();

                }
                break;
            case "waiting_for_Ereignis_interaction":
                if (typ === "Spieler") {
                    debug("Ereigniskarte wird ausgeführt: " + nfcID);
                    Ereignis_ausführen(nfcID);
                    EreigniskarteINFO_ausblenden();
                }
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
            grundstuecke: []
        })
    };

    refresh_main();
    document.getElementById("main").appendChild(bankdiv);
});

let aktuelle_id;

function feldINFO (id) {
    document.getElementById("feldINFO-popup").classList.remove("invisible");

    document.getElementById("feldINFO-popup-title").innerText = data[id]?.name;
    document.getElementById("feldINFO-popup-preis").innerText = data[id]?.preis;
    aktuelle_id = id;
    gameMode = "waiting_for_payment";

};
    function feldINFO_ausblenden () {
        document.getElementById("feldINFO-popup").classList.add("invisible");
        gameMode = "waiting_for_next_action";
    };

function pay(playerId) {

    const player = gameState.get(playerId);
    const field = data[aktuelle_id];
    const ownerId = getBesitzer(aktuelle_id);

    if (!player || !field) return;

    // 🟢 FREI → kaufen
    if (ownerId === null) {

        player.geld -= Number(field.preis);
        player.grundstuecke.push(aktuelle_id);

        debug(player.name + " hat gekauft: " + field.name);
        refresh_main();
        return;
    }

    // 🔴 BESITZT EIN ANDERER → Miete
    if (ownerId !== playerId) {

        const mietpreis = Number(field.preis) / 2;

        player.geld -= mietpreis;
        gameState.get(ownerId).geld += mietpreis;

        debug(player.name + " zahlt Miete an " + gameState.get(ownerId).name);
        refresh_main();
        return;
    }

    // 🟡 EIGENES FELD
    debug("Eigenes Feld");
    error_sound();
};

function getBesitzer(feldId) {
    for (const spielerId of beigetreteneSpieler) {
        const spieler = gameState.get(spielerId);

        if (spieler?.grundstuecke?.includes(feldId)) {
            return spielerId;
        }
    }

    return null;
};

function EreigniskarteINFO (id) {
    document.getElementById("EreigniskarteINFO-popup").classList.remove("invisible");

    document.getElementById("EreigniskarteINFO-popup-title").innerText = data[id]?.titel;
    document.getElementById("EreigniskarteINFO-popup-beschreibung").innerText = data[id]?.beschreibung;
    aktuelle_id = id;
    gameMode = "waiting_for_Ereignis_interaction"
};

    function EreigniskarteINFO_ausblenden () {
        document.getElementById("EreigniskarteINFO-popup").classList.add("invisible");
        gameMode = "waiting_for_next_action";
};

function Ereignis_ausführen (id) {
    debug("fibfiuwbfwilerbgiseblg");
    const player = gameState.get(id);
    const ereignis = data[aktuelle_id];

    if (!player) return;

    player.geld += Number(ereignis["backend-action"]);
    debug(player.name + " hat " + ereignis["backend-action"] + "€ erhalten.");
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