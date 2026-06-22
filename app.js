document.getElementById("main").style.display = "none";

const ndef = new NDEFReader();

document.getElementById("playbuttton").addEventListener("click", async () => {
    document.getElementById("startgamescreen").style.display = "none";
    document.getElementById("main").style.display = "";

    try {
        await ndef.scan();

        ndef.addEventListener("reading", (event) => {
            let tagContent = "";

            for (const record of event.message.records) {
                const textDecoder = new TextDecoder(record.encoding || "utf-8");
                tagContent += textDecoder.decode(record.data);
            }

            console.log("NFC Inhalt:", tagContent);

            window.nfcData = tagContent;
        });

    } catch (err) {
        console.error("NFC Error:", err);
    }
});

function loudPlayer {
    return Object.values(daten.spieler).find(spieler => spieler.id === id);
};


// das Spiel wartet auf Spieler und speichert NFC ids//
tagContent.addEventListener("change", () => {
    if (tagContent >= 1 && tagContent <= 4) {
        loudPlayer(tagContent);
    }

});