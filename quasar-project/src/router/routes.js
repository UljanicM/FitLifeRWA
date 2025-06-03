const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      // Javne rute (dostupne svima, bez meta polja)
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'popisvjezbi', component: () => import('pages/PopisVjezbiPage.vue') },
      { path: 'onama', component: () => import('pages/ONamaPage.vue') },
      { path: 'lokacija', component: () => import('src/pages/LokacijaPage.vue') },
      { path: 'loginpage', component: () => import('src/pages/LoginPage.vue') },
      { path: 'registracija', component: () => import('src/pages/RegistracijaPage.vue') },
      { path: 'info', component: () => import('src/pages/PitajPage.vue') },

      // Ruta 'trazitrenera' sada zahtijeva prijavu
      {
        path: 'trazitrenera',
        name: 'trazitrenera', // Dodano ime rute za lakše referenciranje
        component: () => import('pages/PopisTreneraPage.vue'),
        meta: { requiresAuth: true } // DODANA RESTRIKCIJA
      },

      // Zaštićene rute za članove (zahtijevaju prijavu)
      {
        path: 'profil',
        name: 'user-profile',
        component: () => import('pages/KorisnickiProfilPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'urediprofil',
        name: 'edit-profile',
        component: () => import('pages/UrediProfilPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'popisplanova',
        name: 'popis-planova',
        component: () => import('src/pages/PopisPlanovaPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'pretrazi-druge-clanove',
        name: 'pretrazi-druge-clanove',
        component: () => import('src/pages/PretraziDrugeClanovePage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'clan/:oib',
        name: 'detalji-clana',
        component: () => import('src/pages/DetaljiClanaPage.vue'),
        props: true,
        meta: { requiresAuth: true }
      },

      // Zaštićene rute za trenere (zahtijevaju prijavu i ulogu 'trainer')
      {
        path: 'trainer-profile',
        name: 'trainer-profile',
        component: () => import('src/pages/TrainerProfilePage.vue'),
        meta: { requiresAuth: true, roles: ['trainer'] }
      },
      {
        path: 'unos-plana',
        name: 'unos-plana',
        component: () => import('src/pages/UnosPlanaPage.vue'),
        meta: { requiresAuth: true, roles: ['trainer'] }
      },
    ]
  },

  // Admin rute (zahtijevaju prijavu i ulogu 'admin')
  {
    path: '/admin',
    component: () => import('layouts/AdminLayout.vue'),
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: () => import('pages/AdminPage.vue'),
        meta: { requiresAuth: true, roles: ['admin'] }
      },
      {
        path: 'trazitrenera',
        name: 'admin-trazitrenera',
        component: () => import('pages/PopisTreneraPage.vue'),
        meta: { requiresAuth: true, roles: ['admin'] }
      },
      {
        path: 'unosvjezbi',
        name: 'admin-unosvjezbi',
        component: () => import('src/pages/UnosVjezbiPage.vue'),
        meta: { requiresAuth: true, roles: ['admin'] }
      },
      {
        path: 'loginpage',
        name: 'admin-login',
        component: () => import('src/pages/LoginPage.vue'),
        meta: { requiresAuth: true, roles: ['admin'] }
      },
      {
        path: 'unostrenera',
        name: 'admin-unostrenera',
        component: () => import('src/pages/UnesiTreneraPage.vue'),
        meta: { requiresAuth: true, roles: ['admin'] }
      },
      {
        path: 'logout',
        name: 'logout',
        component: () => import('src/pages/LogoutPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'pregledplanova',
        name: 'admin-pregledplanova',
        component: () => import('src/pages/PopisPlanovaPage.vue'),
        meta: { requiresAuth: true, roles: ['admin'] }
      },
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
];

export default routes;
