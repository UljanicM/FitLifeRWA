const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') }, // Početna stranica
      { path: 'popisTreninga', component: () => import('pages/PopisTreningaPage.vue') }, // Popis svih treninga
      { path: 'popisTrenera', component: () => import('pages/PopisTreneraPage.vue') }, // Popis svih trenera
      { path: 'o_nama', component: () => import('pages/ONamaPage.vue') }, // O nama
      { path: 'lokacije', component: () => import('pages/LokacijePage.vue') }, // Lokacije
      { path: 'login', component: () => import('pages/LoginPage.vue') }, // Login
      { path: 'registracija', component: () => import('pages/RegistracijaPage.vue') } // Registracija
    ]
  },
  {
    path: '/:catchAll(.)',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes