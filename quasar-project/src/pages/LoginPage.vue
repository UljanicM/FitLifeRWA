<template>
  <q-page class="q-pa-md flex justify-center items-center">
    <div class="form-container">
      <h1 class="text-center">Prijava</h1>
      <p class="text-center">Unesite svoje podatke za prijavu.</p>

      <q-form @submit="loginUser" class="q-gutter-md">
        <q-radio
          v-model="loginType"
          val="member"
          label="Prijava kao član"
          color="primary"
        />
        <q-radio
          v-model="loginType"
          val="trainer"
          label="Prijava kao trener"
          color="secondary"
          class="q-ml-md"
        />

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
    const loginType = ref("member"); // Novo: 'member' ili 'trainer'
    const loginSuccess = ref(false);

    const loginUser = async () => {
      if (email.value && password.value) {
        const loginData = {
          email: email.value,
          password: password.value,
        };

        let apiUrl = "";
        let localStorageKey = "";
        let redirectPath = "";

        if (loginType.value === "member") {
          apiUrl = "http://localhost:3000/api/login";
          localStorageKey = "clan";
          redirectPath = "/"; // PROMJENA: Preusmjeravanje člana na naslovnicu
        } else { // loginType.value === "trainer"
          apiUrl = "http://localhost:3000/api/trainer/login";
          localStorageKey = "trainer";
          redirectPath = "/trainer-profile";
        }

        try {
          const response = await axios.post(apiUrl, loginData);

          console.log("Prijava uspješna:", response.data);

          $q.notify({
            type: 'positive',
            message: 'Prijava uspješna!',
            position: 'top'
          });

          // Spremanje korisničkih/trenerovih podataka u localStorage
          localStorage.setItem(localStorageKey, JSON.stringify(response.data[localStorageKey]));
          
          // Emitiranje custom eventa kako bi se MainLayout ažurirao
          window.dispatchEvent(new Event('auth-change'));

          email.value = "";
          password.value = "";

          // Specijalna provjera za admina (ako se admin prijavljuje kao član)
          const loggedInEntity = response.data[localStorageKey];
          if (loggedInEntity && loggedInEntity.role === "admin") {
            router.push("/admin");
          } else {
            router.push(redirectPath);
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
      loginType,
      loginSuccess,
      loginUser,
    };
  },
};
</script>

<style scoped>
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
