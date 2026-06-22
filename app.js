const ndef = new NDEFReader();

let nfcId = null;

ndef.addEventListener("reading", event => {
  for (const record of event.message.records) {

    if (record.recordType === "text") {
      nfcId = Number(new TextDecoder().decode(record.data));
    }

  }
});