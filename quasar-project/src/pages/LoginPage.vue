<template>
  <q-page class="q-pa-md flex justify-center items-center">
    <div class="form-container">
      <h1 class="text-center">Prijava</h1>
      <p class="text-center">Unesite svoje podatke za prijavu.</p>

      <q-form @submit="loginUser" class="q-gutter-md">
        <q-input
          v-model="email"
          label="Email adresa"
          type="email"
          :rules="[
            val => val && val.length > 0 || 'Email adresa je obavezna',
            val => /.+@.+\..+/.test(val) || 'Unesite ispravnu email adresu'
          ]"
          lazy-rules
        />

        <q-input
          v-model="password"
          label="Lozinka"
          type="password"
          :rules="[val => val && val.length > 0 || 'Lozinka je obavezna']"
          lazy-rules
        />

        <q-btn label="Potvrdi" type="submit" color="primary" class="full-width-btn" />
      </q-form>
    </div>
  </q-page>
</template>

<script>
import axios from "axios";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from 'quasar';

export default {
  setup() {
    const router = useRouter();
    const $q = useQuasar();

    const email = ref("");
    const password = ref("");
    const loginSuccess = ref(false);

    const loginUser = async () => {
      if (email.value && password.value) {
        const loginData = {
          email: email.value,
          password: password.value,
        };

        try {
          const response = await axios.post("http://localhost:3000/api/login", loginData);

          console.log("Prijava uspješna:", response.data);

          $q.notify({
            type: 'positive',
            message: 'Prijava uspješna!',
            position: 'top'
          });

          localStorage.setItem("clan", JSON.stringify(response.data.clan));
          
          // Emitiranje custom eventa kako bi se MainLayout ažurirao
          window.dispatchEvent(new Event('auth-change'));

          email.value = "";
          password.value = "";

          const clan = response.data.clan;
          if (clan && clan.role === "admin") {
            router.push("/admin"); // Administratori i dalje idu na /admin
          } else {
            // OVDJE JE KLJUČNA PROMJENA: Preusmjeravanje na naslovnicu za obične članove
            router.push("/"); 
          }

        } catch (error) {
          console.error("Greška pri prijavi:", error);
          $q.notify({
            type: 'negative',
            message: error.response && error.response.data && error.response.data.message
                       ? error.response.data.message
                       : "Došlo je do greške pri prijavi.",
            position: 'top'
          });
        }
      } else {
        $q.notify({
          type: 'warning',
          message: 'Molimo unesite email adresu i lozinku.',
          position: 'top'
        });
      }
    };

    return {
      email,
      password,
      loginSuccess,
      loginUser,
    };
  },
};
</script>

<style scoped>
/* Vaši stilovi ostaju isti */
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

.q-input {
  width: 100%;
}

.q-mb-md {
  margin-bottom: 20px;
}
</style>
