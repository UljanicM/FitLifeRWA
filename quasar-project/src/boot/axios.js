import { boot } from 'quasar/wrappers';
import axios from 'axios';
import { LocalStorage } from 'quasar';

console.log('--- src/boot/axios.js: File loaded ---'); 

const api = axios.create({ baseURL: 'http://localhost:3000/api' });
console.log('--- src/boot/axios.js: Axios API instance created ---'); 

export default boot(({ app, router }) => {
  console.log('--- src/boot/axios.js: boot function executed ---'); 
  app.config.globalProperties.$api = api;

  // --- REQUEST INTERCEPTOR ---
  api.interceptors.request.use(config => {
    const token = LocalStorage.getItem('token'); 
    console.log('Axios Interceptor (Request): Checking for token in LocalStorage:', token ? 'Token found' : 'No token found'); 

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Axios Interceptor (Request): Authorization header set:', config.headers.Authorization); 
    } else {
      console.log('Axios Interceptor (Request): No token, Authorization header not set.'); 
    }
    return config;
  }, error => {
    console.error('Axios Interceptor (Request Error):', error);
    return Promise.reject(error);
  });
  console.log('--- src/boot/axios.js: Request interceptor set up ---'); 

  // --- RESPONSE INTERCEPTOR ---
  api.interceptors.response.use(response => {
    return response;
  }, error => {
    console.error('Axios Interceptor (Response Error):', error.response || error); 
    if (error.response) {
      const { status } = error.response;

      if (status === 401 || status === 403) {
        console.error('API Error: Authentication/Authorization failed, clearing session and redirecting.');
        LocalStorage.remove('token');
        LocalStorage.remove('clan');
        LocalStorage.remove('trainer');

        window.dispatchEvent(new Event('auth-change'));

        // PROMJENA OVDJE: Koristi 'loginpage' umjesto 'login'
        if (router.currentRoute.value.name !== 'loginpage') { 
          router.push({ name: 'loginpage' }); // PROMJENA
          import('quasar').then(({ useQuasar }) => {
            const $q = useQuasar();
            $q.notify({
              type: 'negative',
              message: 'Vaša sesija je istekla ili nemate dozvolu. Molimo prijavite se ponovo.',
              position: 'top'
            });
          });
        }
      }
    }
    return Promise.reject(error);
  });
  console.log('--- src/boot/axios.js: Response interceptor set up ---'); 
});

export { api };
