const ndef = new NDEFReader();
let nfcId = null;

document.getElementById("playbutton").addEventListener("click", async () => {
  try {
    await ndef.scan();

    ndef.addEventListener("reading", event => {
      for (const record of event.message.records) {

        if (record.recordType === "text") {
          nfcId = Number(new TextDecoder().decode(record.data));
        }

      }
    });

  } catch (err) {
    console.error(err);
  }
});