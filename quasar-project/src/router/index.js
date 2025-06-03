// src/router/index.js
import { route } from 'quasar/wrappers';
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router';
import routes from './routes'; // Uvozimo niz ruta iz './routes.js'
import { LocalStorage } from 'quasar'; // Uvezite Quasarov LocalStorage

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
    let userData = null;

    // ******************************************************
    // KONAČNA PROMJENA OVDJE: Uklonjen JSON.parse()
    // LocalStorage.getItem() automatski parsira objekte
    // ******************************************************
    const storedClan = LocalStorage.getItem('clan'); // Dohvaća već parsirani objekt ili null
    const storedTrainer = LocalStorage.getItem('trainer'); // Dohvaća već parsirani objekt ili null

    console.log('Router beforeEach: Checking auth...'); // DEBUG LOG
    console.log('Router beforeEach: storedClan:', storedClan); // DEBUG LOG
    console.log('Router beforeEach: storedTrainer:', storedTrainer); // DEBUG LOG

    if (storedClan) {
      try {
        userData = storedClan; // storedClan je već JavaScript objekt
        isAuthenticated = true;
        userRole = userData.role || 'member'; // Pretpostavi 'member' ako uloga nije eksplicitno definirana
        console.log('Router beforeEach: Authenticated as Clan. Role:', userRole); // DEBUG LOG
      } catch (e) {
        console.error("Router beforeEach: Greška pri obradi podataka člana iz LocalStorage-a:", e);
        LocalStorage.remove('clan'); // Očisti neispravne podatke
        isAuthenticated = false;
      }
    } else if (storedTrainer) { 
      try {
        userData = storedTrainer; // storedTrainer je već JavaScript objekt
        isAuthenticated = true;
        userRole = userData.role || 'trainer'; // Pretpostavi 'trainer' ako uloga nije eksplicitno definirana
        console.log('Router beforeEach: Authenticated as Trainer. Role:', userRole); // DEBUG LOG
      } catch (e) {
        console.error("Router beforeEach: Greška pri obradi podataka trenera iz LocalStorage-a:", e);
        LocalStorage.remove('trainer'); // Očisti neispravne podatke
        isAuthenticated = false;
      }
    }
    // Ako ni 'clan' ni 'trainer' nisu pronađeni ili su neispravni, isAuthenticated ostaje false, userRole ostaje null

    // Logika za rute koje zahtijevaju prijavu
    if (to.meta.requiresAuth) {
      if (!isAuthenticated) {
        console.log('Router beforeEach: Route requires auth, but not authenticated. Redirecting to login.'); // DEBUG LOG
        next({ name: 'login' });
      } else {
        // Korisnik je prijavljen, sada provjeri uloge ako su specificirane
        if (to.meta.roles && to.meta.roles.length > 0) {
          if (userRole && to.meta.roles.includes(userRole)) {
            console.log('Router beforeEach: Authenticated and authorized for role. Proceeding.'); // DEBUG LOG
            next();
          } else {
            console.warn(`Router beforeEach: Unauthorized role access to route '${to.path}'. Required: ${to.meta.roles.join(', ')}, Current: ${userRole}.`); // DEBUG LOG
            // Korisnik nema potrebnu ulogu, preusmjeri ga na odgovarajuću stranicu
            if (userRole === 'member') {
              next({ name: 'user-profile' });
            } else if (userRole === 'trainer') {
              next({ name: 'trainer-profile' });
            } else if (userRole === 'admin') {
              next({ name: 'admin-dashboard' });
            } else {
              next({ path: '/' });
            }
          }
        } else {
          // Prijavljen, nema specifičnih uloga, dopusti pristup
          console.log('Router beforeEach: Authenticated, no specific role required. Proceeding.'); // DEBUG LOG
          next();
        }
      }
    }
    // Logika za rute koje su samo za neprijavljene korisnike (login, registracija)
    else if (to.meta.guestOnly) {
      if (isAuthenticated) {
        console.log('Router beforeEach: Guest-only route, but authenticated. Redirecting.'); // DEBUG LOG
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
        console.log('Router beforeEach: Guest-only route, not authenticated. Proceeding.'); // DEBUG LOG
        next();
      }
    }
    // Za sve ostale rute koje nemaju specifična meta polja, dopusti pristup
    else {
      console.log('Router beforeEach: Public route. Proceeding.'); // DEBUG LOG
      next();
    }
  });

  return Router;
});
