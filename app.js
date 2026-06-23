let = data;
async function init() {
    response = await fetch("Datenbank.json");
    data = await response.json();

    debug(data);
}

init();

const startgame = document.getElementById("playbutton"); //festlegung des Spielstart buttons

let gameMode = "waiting_for_players"

const ndef = new NDEFReader(); //Element das NFC ließt
let nfcID = ""; //Varibale für das Auslesen der Tags

document.getElementById("main").style.display = "none"; //nur der Button ist sichtbar

startgame.addEventListener("click", async () => {
    document.getElementById("startgamescreen").style.display = "none";
    document.getElementById("main").style.display = "";

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


function invite_Players (id) { //Funktion für das arbeiten mit NFC
    return data[id]?.name
};

function debug(msg) { //statt Console
    document.getElementById("debug").innerText += msg + "\n";
};

console.log()