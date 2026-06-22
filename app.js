document.getElementById("main").style.display = "none";

const tagTextEl = document.getElementById("tagtext");

const ndef = new NDEFReader();

document.getElementById("playbutton").addEventListener("click", async () => {
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

function debug(msg) {
    document.getElementById("debug").innerText += msg + "\n";
}