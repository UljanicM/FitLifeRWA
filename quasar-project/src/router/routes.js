const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'popisvjezbi', component: () => import('pages/PopisVjezbiPage.vue') }, // Popis Trenera
      { path: 'trazitrenera', component: () => import('pages/PopisTreneraPage.vue') }, // Pretraživanje
      { path: 'o_nama', component: () => import('pages/ONamaPage.vue') }, // O nama
      { path: 'lokacija', component: () => import('src/pages/LokacijaPage.vue') }, // Lokacija
      { path: 'loginpage', component: () => import('src/pages/LoginPage.vue') }, // Login
      { path: 'registracija', component: () => import('src/pages/RegistracijaPage.vue') }, // Registracija
      { path: 'trazitrenera', component: () => import('src/pages/TraziTreneraPage.vue') }, // Registracija
      { path: 'info', component: () => import('src/pages/PitajPage.vue') }, // Registracija


      
    ]
  },
  {
    path: '/:catchAll(.)',
    component: () => import('pages/ErrorNotFound.vue')
    
  }
]

export default routes