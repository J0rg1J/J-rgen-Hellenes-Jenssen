// Henter html elementene som Javascript skal bruke senere
const produktListe = document.querySelector("#produkt-liste");
const handlekurvListe = document.querySelector("#handlekurv-liste");
const totalPrisElement = document.querySelector("#total-pris");
const tomHandlekurvKnapp = document.querySelector("#tom-handlekurv");
const bestillKnapp = document.querySelector("#bestill-knapp");
const meldingElement = document.querySelector("#melding");
const scrollButton = document.querySelector("#scrollButton");

// Lager en forbindelse til Supabase ved å bruke URL og nøkkel
const supabaseUrl = "https://vkuplcldclmcfcbtdlgf.supabase.co";
const supabaseKey = "sb_publishable_8e_elINpvMIHGBLTdzzd0g_mzRXXS0K";

// Sjekker om Supabase er lastet inn før jeg prøver å koble til databasen
const supabaseClient = window.supabase
  ? window.supabase.createClient(supabaseUrl, supabaseKey)
  : null;

// Lager lister som skal brukes til produktene og handlekurven
let produkter = [];
let handlekurv = [];

// denne funksjonen viser meldinger til brukeren, for eksempel hvis noe går galt
function visMelding(tekst) {
  if (meldingElement) {
    meldingElement.textContent = tekst;
  }
}

// denne funksjonen henter produktene fra databasen og sender dem videre til visProdukter-funksjonen
async function hentProdukter() {
  if (!supabaseClient) {
    console.error("Supabase-biblioteket ble ikke lastet inn.");
    visMelding("Kunne ikke koble til databasen.");
    return;
  }

  const { data, error } = await supabaseClient
    .from("produkter")
    .select("id, navn, pris, ikon, beskrivelse")
    .order("id", { ascending: true });

  if (error) {
    console.error("Feil ved henting av produkter:", error);
    visMelding("Kunne ikke hente produkter.");
    return;
  }

  produkter = data || [];
  visProdukter();
}

// dette får "produkter" delen av html-en til å vise produktene som er i databasen
function visProdukter() {
  produktListe.innerHTML = "";

  produkter.forEach(function (produkt) {
    produktListe.innerHTML += `
      <article class="produkt-kort">
        <p class="produkt-ikon">${produkt.ikon || ""}</p>
        <h3>${produkt.navn}</h3>
        <p>${produkt.beskrivelse}</p>
        <p>${produkt.pris} kr</p>
        <button type="button" data-produkt-id="${produkt.id}">
          Legg i handlekurv
        </button>
      </article>
    `;
  });
}

// Legger et valgt produkt i handlekurven basert på produktets id
function leggTilIHandlekurv(produktId) {
  const produkt = produkter.find(function (produkt) {
    return produkt.id === produktId;
  });

  // Hvis produktet ikke finnes, stoppes funksjonen
  if (!produkt) {
    visMelding("Fant ikke produktet.");
    return;
  }

  handlekurv.push(produkt);
  visHandlekurv();
  visMelding(`${produkt.navn} ble lagt i handlekurven.`);
}

// denne funksjonen viser produktene i handlekurven og regner ut totalprisen
function visHandlekurv() {
  handlekurvListe.innerHTML = "";

  if (handlekurv.length === 0) {
    handlekurvListe.innerHTML = "<p>Handlekurven er tom.</p>";
    totalPrisElement.textContent = "0";
    return;
  }

  let total = 0;

  handlekurv.forEach(function (produkt) {
    handlekurvListe.innerHTML += `
      <p>${produkt.navn} - ${produkt.pris} kr</p>
    `;

    total += Number(produkt.pris);
  });

  // denne linjen oppdaterer totalprisen i html-en
  totalPrisElement.textContent = total;
}

// denne funksjonen tømmer handlekurven
function tomHandlekurv() {
  if (handlekurv.length === 0) {
    visMelding("Handlekurven er allerede tom.");
    return;
  }

  handlekurv = [];
  visHandlekurv();
  visMelding("Handlekurven er tømt.");
}

// denne funksjonen sender bestillingen til orders-tabellen i Supabase
async function bestill() {
  if (handlekurv.length === 0) {
    visMelding("Du kan ikke bestille med tom handlekurv.");
    return;
  }

  const navn = prompt("Skriv inn navn:");
  const epost = prompt("Skriv inn e-post:");
  const adresse = prompt("Skriv inn adresse:");

  if (!navn || !epost || !adresse) {
    visMelding("Du må fylle inn navn, e-post og adresse.");
    return;
  }

  const total = handlekurv.reduce(function (sum, produkt) {
    return sum + Number(produkt.pris);
  }, 0);

  const orderItems = handlekurv.map(function (produkt) {
    return {
      id: produkt.id,
      navn: produkt.navn,
      pris: produkt.pris,
    };
  });

  const { error } = await supabaseClient.from("orders").insert([
    {
      customer_name: navn,
      customer_email: epost,
      customer_address: adresse,
      total_price: total,
      items: orderItems,
    },
  ]);

  if (error) {
    console.error(error);
    visMelding("Kunne ikke fullføre bestillingen.");
    return;
  }

  handlekurv = [];
  visHandlekurv();
  visMelding("Bestillingen er fullført.");
}

// denne delen sjekker om brukeren trykker på en legg i handlekurv-knapp
produktListe.addEventListener("click", function (event) {
  if (!event.target.matches("[data-produkt-id]")) {
    return;
  }

  const produktId = Number(event.target.dataset.produktId);
  leggTilIHandlekurv(produktId);
});

// Kobler tøm-knappen og bestill-knappen til funksjonene sine
tomHandlekurvKnapp.addEventListener("click", tomHandlekurv);
bestillKnapp.addEventListener("click", bestill);

// denne delen gjør at hero-knappen scroller ned til produktene
if (scrollButton) {
  scrollButton.addEventListener("click", function () {
    document.querySelector("#produkter").scrollIntoView({ behavior: "smooth" });
  });
}

// Viser en tom handlekurv når siden åpnes, og henter produktene fra Supabase
visHandlekurv();
hentProdukter();
