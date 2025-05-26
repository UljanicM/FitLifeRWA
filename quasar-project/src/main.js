// src/main.js

import { createApp } from 'vue'; // Importiraj funkciju za kreiranje Vue aplikacije
import App from './App.vue'; // Importiraj glavnu App komponentu
import { Quasar } from 'quasar'; // Importiraj Quasar framework
import quasarUserOptions from './quasar-user-options'; // Importiraj Quasar konfiguraciju
import router from './router'; // Importiraj Vue Router (pretpostavljam da ga imate)

// Kreiraj instancu Vue aplikacije
const app = createApp(App);

// Inicijaliziraj Quasar framework
// OVO JE KLJUČNO ZA RJEŠAVANJE TypeError: $q.notify is not a function
app.use(Quasar, quasarUserOptions);

// Inicijaliziraj Vue Router
app.use(router);

// Montiraj Vue aplikaciju na DOM element s ID-jem 'app'
app.mount('#app');