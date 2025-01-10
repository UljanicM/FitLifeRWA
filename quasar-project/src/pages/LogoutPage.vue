<template>
  <q-page class="q-pa-md flex justify-center items-center">
    <div class="form-container">
      <h1 class="text-center">Kliknite za odjavu.</h1>
      

      <!-- Gumb za logout -->
      <q-btn label="Odjavi se" color="negative" @click="confirmLogout" class="full-width-btn" />
    </div>
  </q-page>
</template>

<script>
export default {
  methods: {
    confirmLogout() {
      // Prikazivanje potvrde korisniku
      const isConfirmed = confirm("Jeste li sigurni da se želite odjaviti?");
      
      // Ako korisnik potvrdi, obriši podatke i preusmjeri
      if (isConfirmed) {
        // Brisanje podataka o korisniku (ako je pohranjen u localStorage)
        localStorage.removeItem('user');

        // Preusmjerenje na stranicu koja nije admin
        this.$router.push('/');
      }
    }
  }
};
</script>

<style scoped>
/* Stilizacija za logout gumb i stranicu */
.form-container {
  background-color: #fff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
}

h1 {
  font-size: 2.5rem;
  color: #422c50;
  margin-bottom: 15px;
  font-weight: bold;
}

p {
  font-size: 1.2rem;
  color: #7f8c8d;
  margin-bottom: 30px;
}

.q-btn {
  width: 100%;
  margin-top: 20px;
  border-radius: 10px;
  padding: 12px 0;
}

.q-btn:hover {
  background-color: #6619d2;
  transform: scale(1.05);
  transition: transform 0.3s ease, background-color 0.3s ease;
}
</style>
