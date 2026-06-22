const scanbutton = document.getElementById("scanbutton");
const tagTextEl = document.getElementById("tagtext");

const ndef = new NDEFReader();

scanbutton.addEventListener("click", async () => {
    try {
        await ndef.scan();
        tagTextEl.textContent = "Halt NFC dran...";
    } catch (err) {
        tagTextEl.textContent = "Fehler: " + err;
    }
});

ndef.onreading = (event) => {
    const uid = event.serialNumber;
    tagTextEl.textContent = "UID: " + uid;
};