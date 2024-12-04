const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'popisvjezbi', component: () => import('pages/PopisVjezbi.vue') }, // Popis Trenera
      { path: 'trazitrenera', component: () => import('pages/TraziTrenera.vue') }, // Pretraživanje
      { path: 'o_nama', component: () => import('pages/ONama.vue') }, // O nama
      { path: 'lokacija', component: () => import('src/pages/LokacijaPage.vue') }, // Lokacija
      { path: 'loginpage', component: () => import('src/pages/LoginPage.vue') }, // Login
      { path: 'registracijapage', component: () => import('src/pages/RegistracijaPage.vue') } // Registracija
      
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
    
  }
]

export default routes