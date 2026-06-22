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

            debug("NFC Inhalt:", tagContent);

            window.nfcData = tagContent;
        });

    } catch (err) {
        debug("NFC Error:", err);
    }
});


tagContent.addEventListener("change", () => {
    const player5_test = document.createElement("p");
    document.getElementById("main").appendChild(player5_test);
    player5_test.textContent = tagContent;
    debug(tagContent);
    
})

function debug(msg) {
    document.getElementById("debug").innerText += msg + "\n";
}