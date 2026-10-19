document.getElementById("playbutton_NFC_inject").addEventListener("click", function() {
    document.getElementById("NFC_inject").classList.remove("invisible");
    
    document.getElementById("startgamescreen").classList.add("invisible");
    document.getElementById("main").classList.remove("invisible");

    document.getElementById("nfc_submit").addEventListener("click", function() {
        handle_NFC_inject_input();
    });

    document.getElementById("nfc_id_input").addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            handle_NFC_inject_input();
        }
    });

});

function handle_NFC_inject_input(predefinedNFCID) {
        let nfcID = document.getElementById("nfc_id_input").value;
        if (nfcID === "") {
            nfcID = predefinedNFCID; // Replace with actual predefined NFC ID if available
        }

        debug(nfcID + " (von PC debug)");
        debug("typ:" + data[nfcID]?.typ)

        const typ = data[nfcID]?.typ;

        if (typ === "Spieler") {
            playSound(data[nfcID]?.name)
        };

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
                if (typ === "Spieler" && !beigetreteneSpieler.has(nfcID)) {
                    playSound("error");
                }
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
                    if (idTransmitter) {
                        idTransmitter(nfcID);
                        idTransmitter = null;
                    }
                }
                else {
                    debug("Buttonaktion: Keine Spielerkarte gescannt;" + "NfcID:" + nfcID);
                    if (idTransmitter) {
                        idTransmitter(nfcID);
                        idTransmitter = null;
                    }
                }
                break;
            case "NFC_gespert":
                debug("NFC ist gespert");
                break;
        };

        document.getElementById("nfc_id_input").value = "";
    };

function destroyMoney(money) {
    if (money === undefined) {
        money = document.getElementById("nfc_id_input").value;
        document.getElementById("nfc_id_input").value = "";
    }

    for (let playerID of beigetreteneSpieler) {
        gameState.get(playerID).geld = money;
        debug(gameState.get(playerID).name + " hat jetzt " + gameState.get(playerID).geld + "€");
    }
    refresh_main();
};

function quick_100() {
    handle_NFC_inject_input(1);
    handle_NFC_inject_input(2);
    document.getElementById("lobbyFertig_button").click();
    destroyMoney(100);
    document.getElementById("quick_100").hidden = true;
}