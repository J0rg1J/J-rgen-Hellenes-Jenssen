// Henter html elementene som Javascript skal bruke senere
const produktListe = document.querySelector("#produkt-liste");
const handlekurvListe = document.querySelector("#handlekurv-liste");
const totalPrisElement = document.querySelector("#total-pris");
const tomHandlekurvKnapp = document.querySelector("#tom-handlekurv");
const bestillKnapp = document.querySelector("#bestill-knapp");
const meldingElement = document.querySelector("#melding");

// Lager en forbindelse til Supabase ved å bruke URL og nøkkel
const supabaseUrl = "https://vkuplcldclmcfcbtdlgf.supabase.co";
const supabaseKey = "sb_publishable_8e_elINpvMIHGBLTdzzd0g_mzRXXS0K";

const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// denne funksjonen henter produktene fra databasen og putter dem i konsollen slik at visProdukter-funksjonen kan bruke dem til å vise dem på nettsiden
async function hentProdukter() {
  const { data, error } = await supabaseClient.from("produkter").select("*");

  if (error) {
    console.error("Feil ved henting av produkter:", error);
    meldingElement.textContent = "Kunne ikke hente produkter.";
    return;
  }

  console.log("Produkter hentet fra Supabase:", data);

  visProdukter(data);
}

// dette får "produkter" delen av html-en til å vise produktene som er i databasen
function visProdukter(produkter) {
  produktListe.innerHTML = "";

  produkter.forEach(function (produkt) {
    produktListe.innerHTML += `
      <article class="produkt-kort">
        <h3>${produkt.navn}</h3>
        <p>${produkt.beskrivelse}</p>
        <p>${produkt.pris} kr</p>
        <button>Legg i handlekurv</button>
      </article>
    `;
  });
}

hentProdukter();
