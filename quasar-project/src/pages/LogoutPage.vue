<template>
  <q-page class="flex flex-center">
    <q-spinner
      color="primary"
      size="3em"
      :thickness="2"
    />
    <p class="q-mt-md">Obrada odjave...</p>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

const router = useRouter();
const $q = useQuasar();

onMounted(() => {
  // Prikaz dijaloškog okvira za potvrdu odjave
  $q.dialog({
    title: 'Potvrda odjave',
    message: 'Jeste li sigurni da se želite odjaviti?',
    ok: 'Da',     // PROMJENA: Gumb za potvrdu je sada 'Da'
    cancel: 'Ne', // PROMJENA: Gumb za otkazivanje je sada 'Ne'
    persistent: true // Korisnik mora kliknuti OK/Cancel, ne može kliknuti izvan
  }).onOk(() => {
    // Ako korisnik potvrdi odjavu
    localStorage.removeItem('clan'); // Ukloni podatke o članu
    
    // Emitiraj globalni događaj da se MainLayout ažurira
    window.dispatchEvent(new Event('auth-change')); 

    $q.notify({
      type: 'info',
      message: 'Uspješno ste se odjavili.',
      position: 'top'
    });
    router.push('/loginpage'); // Preusmjeri na stranicu za prijavu
  }).onCancel(() => {
    // Ako korisnik otkaže odjavu
    $q.notify({
      type: 'info',
      message: 'Odjava otkazana.',
      position: 'top'
    });
    // Preusmjeri korisnika natrag na prethodnu stranicu ili naslovnicu
    router.go(-1); // Vrati se na prethodnu stranicu
  });
});
</script>

<style scoped>
/* Stilovi za ovu stranicu (ako su potrebni, npr. za spinner) */
</style>
