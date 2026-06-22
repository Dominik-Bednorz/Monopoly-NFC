if (window.innerWidth > 423){
  document.getElementById("überschrift").style.display = "";
  document.getElementById("überschrift_handy").style.display = "none";
}
else {
  document.getElementById("überschrift").style.display = "none";
  document.getElementById("überschrift_handy").style.display = "";
};

//--Variablen--
document.getElementById("hackingInhalt").style.display = "none";
let enter_freigegeben = false;
let hackingMode = null;
const warte_bis_ausgewählt = document.getElementById("fotoinput");
const codeHackingMode = [
  "arrowleft",
  "arrowleft",
  "arrowup",
  "arrowup",
  "arrowright",
  "arrowright",
  "arrowdown",
  "arrowdown",
  "a",
  "d",
  "m",
  "i",
  "n",
  "enter",
];
let esc_holdtime_zähler = null;
let inputTastatur = [];

//--Hacking Mode Log in an--//
document.addEventListener("keydown", (event) => {
  inputTastatur.push(event.key.toLowerCase());

  input = inputTastatur.slice(-codeHackingMode.length);
  if (JSON.stringify(input) === JSON.stringify(codeHackingMode)) {
    hackingMode = true;
    localStorage.setItem("hackingMode", hackingMode);
    enter_freigegeben = false;
    hackingModechange();
  setTimeout(() => {
    enter_freigegeben = true;
  }, 500);
}
});

//--Hacking Mode Log in an Dev--//
document.addEventListener("keydown", (event) => {
  if (event.key === "h" ) {
  hackingMode = !hackingMode;
  localStorage.setItem("hackingMode", hackingMode);
  hackingModechange();
  }
});

//--Hacking Mode Log in aus--//
let esc_gedrückt = false;
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && hackingMode) {
    esc_gedrückt = true;

    setTimeout(() => {
      if (esc_gedrückt) {
        hackingMode = false;
        localStorage.setItem("hackingMode", hackingMode);
        hackingModechange();
      }
    }, 2000);
  }
});

document.addEventListener("keyup", (event) => {
  if(event.key === "Escape") {
    esc_gedrückt = false;
  }
});

//--Hacking Mode Log in an/aus Funktion--//
function hackingModechange() {
  if (hackingMode) {
    document.getElementById("body").classList.add("hackingModelogon");
    document.getElementById("main").style.display = "none";
    document.getElementById("quellen").style.display = "none";
    document.getElementById("HackingLogOn").style.display = "";
  }
  else {
    document.getElementById("body").classList.remove("hackingModelogon");
    document.getElementById("main").style.display = "";
    document.getElementById("HackingLogOn").style.display = "none";
  }
}

//--Hacking Mode Login--//
document.getElementById("login-button").addEventListener("click", () => {
  connect_to_backend();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && hackingMode && enter_freigegeben) {
    connect_to_backend();
  }
});

function connect_to_backend() {
  console.log("Verbinde...");
  laden();
  let inputedCode = document.getElementById("passwordInput");
  fetch("https://pdf-konverter-backend.onrender.com/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      inputedCode: inputedCode.value
    }),
  })

.then(res => res.json())
.then(data => {
  ladenAus();
  if (data.success) {
    console.log("Login erfolgreich!");
    loginErfolgreich();
  }
  else {
    console.log("Login fehlgeschlagen!");
    document.getElementById("login-button").classList.add("rot_shake");
    document.getElementById("passwordInput").classList.add("rot_shake");
    setTimeout(() => {
      document.getElementById("login-button").classList.remove("rot_shake");
      document.getElementById("passwordInput").classList.remove("rot_shake");
    }, 200);
  }
});
};

function laden() {
  const louder_overlay = document.createElement("div");
  louder_overlay.classList.add("overlay");
  document.body.appendChild(louder_overlay);

  const loader = document.createElement("div");
  loader.classList.add("loader");
  louder_overlay.appendChild(loader);

  const cell1 = document.createElement("div");
  cell1.classList.add("cell", "d-0");
  loader.appendChild(cell1);

  const cell2 = document.createElement("div");
  cell2.classList.add("cell", "d-1");
  loader.appendChild(cell2);

  const cell3 = document.createElement("div");
  cell3.classList.add("cell", "d-2");
  loader.appendChild(cell3);

  const cell4 = document.createElement("div");
  cell4.classList.add("cell", "d-1");
  loader.appendChild(cell4);

  const cell5 = document.createElement("div");
  cell5.classList.add("cell", "d-2");
  loader.appendChild(cell5);

  const cell6 = document.createElement("div");
  cell6.classList.add("cell", "d-2");
  loader.appendChild(cell6);

  const cell7 = document.createElement("div");
  cell7.classList.add("cell", "d-3");
  loader.appendChild(cell7);

  const cell8 = document.createElement("div");
  cell8.classList.add("cell", "d-3");
  loader.appendChild(cell8);

  const cell9 = document.createElement("div");
  cell9.classList.add("cell", "d-4");
  loader.appendChild(cell9);
}

function ladenAus() {
  document.querySelector(".overlay")?.remove();
}

//--Auto an--//
addEventListener("DOMContentLoaded", () => { //auto an am Beginn//
  hackingMode = localStorage.getItem("hackingMode") === "true";
  hackingModechange();
  if (hackingMode) {
    enter_freigegeben = true;
  }
});

//--Login erfolgreich--//
function loginErfolgreich() {
  document.getElementById("HackingLogOn").style.display = "none";
  document.getElementById("body").classList.remove("hackingModelogon");
  document.getElementById("main").style.display = "";
  document.getElementById("HackingLogOn").style.display = "none";
  document.getElementById("hackingInhalt").style.display = "";
}

//--Datei auswählen; Button an--//
document.getElementById("convert").disabled = true;
warte_bis_ausgewählt.addEventListener("change", () => {
  const name = warte_bis_ausgewählt.files[0].name;
  document.getElementById("label").textContent = name + " ausgewählt";
  document.getElementById("convert").textContent = "Konvertieren";
  document.getElementById("convert").disabled = false;
  document.getElementById("convert").classList.add("glow_green");
});

//--Bild zu PDF konvertieren--//
let imageData = null;

// Input holen
const fileInput = document.getElementById("fotoinput");

// Bild laden
fileInput.addEventListener("change", (event) => {

  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    imageData = e.target.result;
    console.log("Bild geladen!");
  };

  reader.readAsDataURL(file);
});


// Button
const pdfButton = document.getElementById("convert");

pdfButton.addEventListener("click", () => {

  const img = new Image();
  img.src = imageData;

  img.onload = () => {

    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF({
      unit: "px",
      orientation: img.width > img.height ? "landscape" : "portrait",
      format: [img.width, img.height]
    });

    pdf.addImage(
      imageData,
      "JPEG", 0, 0, img.width, img.height
    );

    pdf.save("bild.pdf");

    document.getElementById("convert").textContent = "Erneut konvertieren";
    document.getElementById("convert").classList.remove("glow_green");
    setTimeout(() => {
      document.getElementById("convert").classList.add("glow_green");
    }, 200);
  };
});

// Quellen anzeigen//
document.getElementById("quellen-button").addEventListener("click", () => {
  document.getElementById("main").style.display = "none", "important";
  document.getElementById("quellen").style.display = "";
});

document.getElementById("quellen-zurueck-button").addEventListener("click", () => {
  document.getElementById("main").style.display = "";
  document.getElementById("quellen").style.display = "none";
});