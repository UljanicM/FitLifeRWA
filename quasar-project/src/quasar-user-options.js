// src/quasar-user-options.js

// Uvezite sve Quasar ekstenzije koje koristite
// Obično su ovdje definirani i uvezani CSS-ovi i ikone
import '@quasar/extras/material-icons/material-icons.css'; // Primjer
// Ako koristite druge ikone, dodajte ih ovdje:
// import '@quasar/extras/fontawesome-v6/fontawesome-v6.css'

// Glavni CSS vaše aplikacije
import './css/app.scss'; // Ovo bi trebalo biti tamo

// Uvezite Quasar komponente i dodatke (plugins) koje želite koristiti globalno
// Za $q.notify i $q.dialog, potrebno je osigurati da su Notify i Dialog dostupni.
import {
  QBtn,
  QInput,
  QCard,
  QCardSection,
  QPage,
  QBanner,
  Notify, // OVO JE KLJUČNO ZA $q.notify
  Dialog  // OVO JE KLJUČNO ZA $q.dialog
} from 'quasar';


export default {
  // Globalna konfiguracija Quasara (npr. defaultne boje, itd.)
  config: {},

  // OVDJE SU VAŽNI PLUGINSI!
  // Popis Quasar dodataka (plugins) koji će biti dostupni preko $q objekta.
  // Notify i Dialog su među njima.
  plugins: {
    Notify, // Dodajte Notify ovdje
    Dialog  // Dodajte Dialog ovdje
  },

  // Komponente i direktive koje želite registrirati globalno
  // Ako ne koristite auto-import komponenti u quasar.conf.js,
  // onda biste ih ovdje trebali navesti (npr. QBtn, QInput itd.)
  // Za sada, ako je auto-import omogućen, ovo može ostati prazno.
  components: {
    // QBtn, QInput, QCard, QCardSection, QPage, QBanner
  },
  directives: {
    // vRipple, vClosePopup
  },

  // Definicije za ikone (ako ih koristite)
  iconSet: 'material-icons', // Odgovara importu ikona iznad
  // lang: 'hr' // Hrvatski jezik za Quasar komponente
};
