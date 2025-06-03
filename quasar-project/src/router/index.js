// src/router/index.js
import { route } from 'quasar/wrappers';
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router';
import routes from './routes'; // Uvozimo niz ruta iz './routes.js'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory);

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes, // Ovdje prosljeđujemo uvezeni niz ruta
    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE)
  });

  // GLAVNI NAVIGACIJSKI ČUVAR ZA ZAŠTITU RUTA
  Router.beforeEach((to, from, next) => {
    let isAuthenticated = false;
    let userRole = null;
    let userData = null; // Pomoćna varijabla za pohranu parsiranih podataka

    const storedClan = localStorage.getItem('clan');
    const storedTrainer = localStorage.getItem('trainer'); // Dohvati i podatke trenera

    if (storedClan) {
      try {
        userData = JSON.parse(storedClan);
        isAuthenticated = true;
        userRole = userData.role || 'member'; // Pretpostavi 'member' ako uloga nije eksplicitno definirana
      } catch (e) {
        console.error("Greška pri parsiranju podataka člana iz localStorage-a:", e);
        localStorage.removeItem('clan'); // Očisti neispravne podatke
        isAuthenticated = false;
      }
    } else if (storedTrainer) { // Provjeri trenera samo ako član nije pronađen ili je neispravan
      try {
        userData = JSON.parse(storedTrainer);
        isAuthenticated = true;
        userRole = userData.role || 'trainer'; // Pretpostavi 'trainer' ako uloga nije eksplicitno definirana
      } catch (e) {
        console.error("Greška pri parsiranju podataka trenera iz localStorage-a:", e);
        localStorage.removeItem('trainer'); // Očisti neispravne podatke
        isAuthenticated = false;
      }
    }
    // Ako ni 'clan' ni 'trainer' nisu pronađeni ili su neispravni, isAuthenticated ostaje false, userRole ostaje null

    // Logika za rute koje zahtijevaju prijavu
    if (to.meta.requiresAuth) {
      if (!isAuthenticated) {
        // Korisnik nije prijavljen, preusmjeri na login stranicu
        next({ name: 'login' });
      } else {
        // Korisnik je prijavljen, sada provjeri uloge ako su specificirane
        if (to.meta.roles && to.meta.roles.length > 0) {
          if (userRole && to.meta.roles.includes(userRole)) {
            // Korisnik ima potrebnu ulogu, dopusti pristup
            next();
          } else {
            // Korisnik nema potrebnu ulogu, preusmjeri ga na odgovarajuću stranicu
            console.warn(`Pokušaj pristupa ruti '${to.path}' bez potrebne uloge: ${to.meta.roles}. Trenutna uloga: ${userRole}`);
            // Preusmjeri na profil za članove, ili admin dashboard za admine, ili početnu stranicu
            if (userRole === 'member') {
              next({ name: 'user-profile' });
            } else if (userRole === 'trainer') {
              next({ name: 'trainer-profile' });
            } else if (userRole === 'admin') {
              next({ name: 'admin-dashboard' }); // Preusmjeri admina na admin dashboard
            } else {
              next({ path: '/' }); // Default preusmjeravanje ako uloga nije prepoznata
            }
          }
        } else {
          // Prijavljen, nema specifičnih uloga, dopusti pristup
          next();
        }
      }
    }
    // Logika za rute koje su samo za neprijavljene korisnike (login, registracija)
    else if (to.meta.guestOnly) {
      if (isAuthenticated) {
        // Korisnik je već prijavljen, preusmjeri ga na odgovarajući dashboard/profil
        if (userRole === 'admin') {
          next({ name: 'admin-dashboard' });
        } else if (userRole === 'trainer') {
          next({ name: 'trainer-profile' });
        } else {
          next({ name: 'user-profile' });
        }
      } else {
        // Korisnik nije prijavljen, dopusti pristup (login/registracija)
        next();
      }
    }
    // Za sve ostale rute koje nemaju specifična meta polja, dopusti pristup
    else {
      next();
    }
  });

  return Router;
});
