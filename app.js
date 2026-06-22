const button = document.getElementById("playbutton");
let nfcID = "";
const ndef = new NDEFReader();

button.addEventListener("click", async () => {
    try {
        await ndef.scan();
        debug("NFC-Scan gestartet. Bitte Tag an das Gerät halten...");

        ndef.addEventListener("reading", (event) => {
            let tagContent = "";

            for (const record of event.message.records) {
                const textDecoder = new TextDecoder(record.encoding || "utf-8");
                tagContent += textDecoder.decode(record.data);
            }

            tagContent = tagContent.trim();
            debug(`NFC Inhalt gelesen: ${tagContent}`);

            const parsedNumber = Number(tagContent);
            if (!Number.isNaN(parsedNumber) && tagContent !== "") {
                nfcID = parsedNumber;
                debug(`nfcID gesetzt: ${nfcID}`);
            } else {
                nfcID = tagContent;
                debug(`nfcID gesetzt (nicht numerisch): ${nfcID}`);
            }

            window.nfcID = nfcID;
        });
    } catch (err) {
        debug(`NFC Error: ${err}`);
    }
});

function debug(msg) {
    document.getElementById("debug").innerText += msg + "\n";
}