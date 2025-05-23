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
    path: '/admin',
    component: () => import('layouts/AdminLayout.vue'),
    children: [
      { path: '', component: () => import('pages/AdminPage.vue') },
      { path: '/admin/popisvjezbi', component: () => import('pages/PopisVjezbiPage.vue') }, // Popis vjezbi
      { path: '/admin/trazitrenera', component: () => import('pages/PopisTreneraPage.vue') }, // Pretraživanje
      { path: '/admin/unosvjezbi', component: () => import('src/pages/UnosVjezbiPage.vue') }, // unos vjezbi
      { path: '/admin/loginpage', component: () => import('src/pages/LoginPage.vue') }, // Login
      { path: '/admin/unostrenera', component: () => import('src/pages/UnesiTreneraPage.vue') }, // unos trenera
      { path: '/admin/trazitrenera', component: () => import('src/pages/TraziTreneraPage.vue') }, // trazi trenera
      { path: '/admin/logout', component: () => import('src/pages/LogoutPage.vue') }, // Registracija


      
    ]
  },
  {
    path: '/:catchAll(.)',
    component: () => import('pages/ErrorNotFound.vue')
    
  }
]

export default routes