const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'popisvjezbi', component: () => import('pages/PopisVjezbiPage.vue') },
      { path: 'trazitrenera', component: () => import('pages/PopisTreneraPage.vue') },
      { path: 'onama', component: () => import('pages/ONamaPage.vue') },
      { path: 'lokacija', component: () => import('src/pages/LokacijaPage.vue') },
      { path: 'loginpage', component: () => import('src/pages/LoginPage.vue') },
      { path: 'registracija', component: () => import('src/pages/RegistracijaPage.vue') },
      { path: 'info', component: () => import('src/pages/PitajPage.vue') },
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
        meta: { requiresAuth: true }
      },
      {
        path: 'trainer-profile',
        name: 'trainer-profile',
        component: () => import('src/pages/TrainerProfilePage.vue'),
        meta: { requiresAuth: true, roles: ['trainer'] }
      },
      // NOVA RUTA: Unos Plana (samo za trenere)
      {
        path: 'unos-plana',
        name: 'unos-plana',
        component: () => import('src/pages/UnosPlanaPage.vue'),
        meta: { requiresAuth: true, roles: ['trainer'] } // Pristup samo za trenere
      },
    ]
  },
  {
    path: '/admin',
    component: () => import('layouts/AdminLayout.vue'),
    children: [
      { path: '', component: () => import('pages/AdminPage.vue') },
      { path: 'trazitrenera', component: () => import('pages/PopisTreneraPage.vue') },
      { path: 'unosvjezbi', component: () => import('src/pages/UnosVjezbiPage.vue') },
      { path: 'loginpage', component: () => import('src/pages/LoginPage.vue') },
      { path: 'unostrenera', component: () => import('src/pages/UnesiTreneraPage.vue') },
      { path: 'logout', component: () => import('src/pages/LogoutPage.vue') },
      { path: 'pregledplanova', component: () => import('src/pages/PopisPlanovaPage.vue') },
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
];

export default routes;
