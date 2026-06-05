// Henter html elementene som Javascript skal bruke senere
const produktListe = document.querySelector("#produkt-liste");
const handlekurvListe = document.querySelector("#handlekurv-liste");
const totalPrisElement = document.querySelector("#total-pris");
const tomHandlekurvKnapp = document.querySelector("#tom-handlekurv");
const bestillKnapp = document.querySelector("#bestill-knapp");
const meldingElement = document.querySelector("#melding");

const supabaseUrl = "https://vkuplcldclmcfcbtdlgf.supabase.co";
const supabaseKey = "sb_publishable_8e_elINpvMIHGBLTdzzd0g_mzRXXS0K";

const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

console.log("Supabase er koblet til");
