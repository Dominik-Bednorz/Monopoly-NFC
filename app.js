let data;
async function init() {
    const response = await fetch("Datenbank.json");
    data = await response.json();
}

init();

const startgame = document.getElementById("playbutton"); //festlegung des Spielstart buttons
document.getElementById("playbutton_console").addEventListener("click", () => {
    startgame.click();
    document.getElementById("debug").classList.remove("invisible");
});

let gameMode = "waiting_for_players"

const ndef = new NDEFReader(); //Element das NFC ließt
let nfcID = ""; //Varibale für das Auslesen der Tags

document.getElementById("main").classList.add("invisible");//nur der Button ist sichtbar

const Spezialkarten_AutoPOPUP = document.createElement("div");
function Spezialkarten_AutoPOPUP_handler() {
    if (beigetreteneSpieler.has(4)) {
        const player = gameState.get(4);
        player.geld += 50;
        playSound("bonus");
        debug("Autobonus");
        refresh_main();
    }
};

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
                else {
                    debug("Nur Spieler können beitreten");
                    playSound("error");
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
                if (typ === "Spezialkarte_Auto") {
                    if (beigetreteneSpieler.has(4)) {
                    document.getElementById("main").appendChild(Spezialkarten_AutoPOPUP);
                    Spezialkarten_AutoPOPUP.innerHTML = `
                        <h2>Hast du 6 gewürfelt?</h2>
                        <button onclick="Spezialkarten_AutoPOPUP.remove(); Spezialkarten_AutoPOPUP_handler(); gameMode = 'waiting_for_next_action';">Bestätigen</button>
                        <button onclick="Spezialkarten_AutoPOPUP.remove();">Abbrechen</button>`;
                    }
                    else {
                        debug("Spezialkarte_Auto ist nicht verfügbar, da Spieler 4 nicht beigetreten ist.");
                        playSound("error");
                    };
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
                break;
            case "buttonMode":
                if (typ === "Spieler") {
                    debug("Buttonaktion: Spieler gescannt " + nfcID);
                    if (playerResolver) {
                        playerResolver(nfcID);
                        playerResolver = null;
                    }
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
            grundstuecke: [],
            colorIDs: []
        })
    };

    refresh_main();
    document.getElementById("main").appendChild(bankdiv);
    document.getElementById("player-buttons").classList.remove("invisible");
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
        if (player.name === "Hund" && !player.colorIDs.includes(field.colorID)) {
        player.geld += 50;
        playSound("bonus");
        };

        player.geld -= Number(field.preis);
        player.grundstuecke.push(aktuelle_id);
        player.colorIDs.push(field.colorID);

        playSound("buy");
        debug(player.name + " hat gekauft: " + field.name);
        refresh_main();
        return;
    }

    // 🔴 BESITZT EIN ANDERER → Miete
    if (ownerId !== playerId) {
        const anzahl_an_Felder_mit_der_Farbe = gameState.get(ownerId).colorIDs.filter(id => id === field.colorID).length;
        let mietpreis;

        if (anzahl_an_Felder_mit_der_Farbe >= 2) {
            mietpreis = Number(field.preis);
        }
        else if (field === 19 || field === 20) {
            mietpreis = Number(field.preis_mit_nur_einer_Farbe);
        }
        else  {
            mietpreis = Number(field.preis) / 2;
        };

        player.geld -= mietpreis;
        playSound("cash_in");
        gameState.get(ownerId).geld += mietpreis;

        debug(player.name + " zahlt Miete an " + gameState.get(ownerId).name);
        refresh_main();
        return;
    }

    // 🟡 EIGENES FELD
    debug("Eigenes Feld");
    playSound("error");
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

const QuestionPOPUP_welcher_player = document.createElement("div");
function Ereignis_ausführen (id) {
    const player = gameState.get(id);
    const ereignis = data[aktuelle_id];
    const alleSpieler_außer_der_der_dran_ist = Array.from(beigetreteneSpieler).filter(id => gameState.get(id).name !== player.name);

    if (!player) return;

    if (player.name === "Safe") {
        player.geld += 50;
        playSound("bonus");
    }

    switch (ereignis.TypEreignis) {
        case "Geldtransfer":
            player.geld += Number(ereignis["backend-action"]);
            debug(player.name + " hat " + ereignis["backend-action"] + "€ erhalten.");
            refresh_main();

            break;

        case "SpielfeldONLY":
            
            break;

        case "Erweiterte Logik":
            if (aktuelle_id === 40 || aktuelle_id === 31) {
                player.geld += 50;

                document.getElementById("main").appendChild(QuestionPOPUP_welcher_player);
                QuestionPOPUP_welcher_player.innerHTML = `
                    <h2>Welchen Spieler willst du noch wählen?</h2>
                    <p>${alleSpieler_außer_der_der_dran_ist.map(id => `<button onclick="handlePlayerSelection_Ereigniskarte(${id})">${gameState.get(id).name}</button>`).join("")}</p>`;
                refresh_main();
            }

            if (aktuelle_id === 29) {
                const Anzahl_grundstuecke_von_player = player.grundstuecke.length;
                
                player.geld -= Anzahl_grundstuecke_von_player * 30;
                refresh_main();
            }

            if (aktuelle_id === 32) {
                for (const id of alleSpieler_außer_der_der_dran_ist) {
                    const otherPlayer = gameState.get(id);
                    otherPlayer.geld -= 10;
                    player.geld += 10;
                    refresh_main();
                }
            
            }

            if (aktuelle_id === 37) {
                for (const id of alleSpieler_außer_der_der_dran_ist) {
                    const otherPlayer = gameState.get(id);
                    otherPlayer.geld += 50;
                    player.geld -= 50;
                    refresh_main();
                }
            }
            break;
    }

};

function handlePlayerSelection_Ereigniskarte(selectedPlayerId) {
    const selectedPlayer = gameState.get(selectedPlayerId);
    selectedPlayer.geld += 50;
    refresh_main();
    QuestionPOPUP_welcher_player.remove();
};

function refresh_main () {
    bankdiv_text = "";

    for(const id of beigetreteneSpieler) {
        bankdiv_text += `${gameState.get(id).name}: ${gameState.get(id).geld}€\n`;
    };
    
    bankdiv.innerText = bankdiv_text;
};

//Buttons

let playerResolver = null;

function getPlayer() {
    return new Promise((resolve) => {
        playerResolver = resolve;
    });
}

async function LOS_button() {
    gameMode = "buttonMode";
    debug("Spieler scannen...");
    const playerId = await getPlayer();
    const player = gameState.get(playerId);

    if (!player) {
        debug("Ungültiger Spieler oder kein Spieler gefunden.");
        playSound("error");
        gameMode = "waiting_for_next_action";
        return;
    }

    player.geld += 200;
    debug(player.name + " erhält 200€ für LOS.");
    refresh_main();
    gameMode = "waiting_for_next_action";
};

async function Gefängnis_button() {
    gameMode = "buttonMode";
    debug("Spieler scannen...");
    const playerId = await getPlayer();
    const player = gameState.get(playerId);

    if (!player) {
        debug("Ungültiger Spieler oder kein Spieler gefunden.");
        playSound("error");
        gameMode = "waiting_for_next_action";
        return;
    }

    player.geld -= 100;
    debug(player.name + " bezahlt 100€ für Gefängnis.");
    refresh_main();
    gameMode = "waiting_for_next_action";
};

async function Fliegen_button() {
    gameMode = "buttonMode";
    debug("Spieler scannen...");
    const playerId = await getPlayer();
    const player = gameState.get(playerId);

    if (!player) {
        debug("Ungültiger Spieler oder kein Spieler gefunden.");
        playSound("error");
        gameMode = "waiting_for_next_action";
        return;
    }

    if (player.name === "Flugzeug") {
        playSound("bonus");
        debug(player.name + " Fliegt gratis.");
    }
    else {
    player.geld -= 100;
    debug(player.name + " bezahlt 100€ für Gefängnis.");
    };

    refresh_main();
    gameMode = "waiting_for_next_action";
};

//Sounds
const sounds = {
    error: new Audio("./sounds/error.mp3"),
    buy: new Audio("./sounds/buy.mp3"),
    bonus: new Audio("./sounds/bonus.mp3"),
    cash_in: new Audio("./sounds/cash-in.mp3"),
};

function playSound(soundName) {
    const sound = sounds[soundName];

    if (sound) {
        sound.currentTime = 0;
        sound.play();
    } else {
        debug("Sound nicht gefunden:", soundName);
    }
}


function debug(msg) { //statt Console
    document.getElementById("debug").innerText += msg + "\n";
};