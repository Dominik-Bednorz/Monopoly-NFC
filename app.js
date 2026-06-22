document.getElementById("main").style.display = "none";

const ndef = new NDEFReader();
let tagContent = "";
document.getElementById("playbuttton").addEventListener("click", async () => {
    document.getElementById("startgamescreen").style.display = "none";
    document.getElementById("main").style.display = "";

    try {
        await ndef.scan();

        ndef.addEventListener("reading", (event) => {
            

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


tagContent.addEventListener("change", () => {
    const player5_test = document.createElement("p");
    document.getElementById("main").appendChild(player5_test);
    player5_test.textContent = tagContent;
    
})