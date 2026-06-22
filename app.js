document.getElementById("main").style.display = "none";

const ndef = new NDEFReader();

document.getElementById("playbuttton").addEventListener("click", async () => {
    document.getElementById("startgamescreen").style.display = "none";
    document.getElementById("main").style.display = "";

    try {
        await ndef.scan();

       ndef.onreading = event => {
  const message = event.message;
  for (const record of message.records) {
    console.log("Record type:  " + record.recordType);
    console.log("MIME type:    " + record.mediaType);
    console.log("Record id:    " + record.id);
    switch (record.recordType) {
      case "text":
        // TODO: Read text record with record data, lang, and encoding.
        break;
      case "url":
        // TODO: Read URL record with record data.
        break;
      default:
        // TODO: Handle other records with record data.
    }
  }
};

function debug(msg) {
    document.getElementById("debug").innerText += msg + "\n";
}