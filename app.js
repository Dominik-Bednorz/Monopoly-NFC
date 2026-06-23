const button = document.getElementById("playbutton");

const ndef = new NDEFReader();
let nfcID = "";

button.addEventListener("click", async () => {
    await ndef.scan();

    ndef.onreading = ({ message }) => {
        const record = message.records[0];
        nfcID = Number(new TextDecoder().decode(record.data));

        debug("gescant:" + nfcID);
    };
});


function handle_nfc () {
    debug("test");
};

function debug(msg) {
    document.getElementById("debug").innerText += msg + "\n";
};