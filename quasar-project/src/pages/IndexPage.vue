<template>
  <q-page class="flex flex-center column">
    <img
      alt="Fitlife logo"
      src="~assets/Fitlife.png"
      class="my-image animate-image"
    />
    <!-- Dodan motivacijski citat ispod loga -->
    <div class="motivational-quote">
      "Tvoje tijelo može podnijeti gotovo sve, tvoj um mora biti jači od svih izgovora."
    </div>
  </q-page>
</template>

<script setup>
</script>

<style scoped>
.my-image {
  width: 150px; 
  height: auto; 
}

.animate-image {
  opacity: 0;
  transform: translateY(50px);
  animation: slideUp 1s ease-out forwards;
}

/* Stil za citat ispod loga */
.motivational-quote {
  margin-top: 20px; /* Razmak između loga i citata */
  font-style: italic; /* Stilizacija citata kao kurziv */
  color: black; /* Promijenili smo boju citata na crnu */
  font-size: 1.2rem; /* Veličina fonta */
  text-align: center; /* Centriranje citata */
  opacity: 1; /* Citat je odmah vidljiv */
  transform: translateY(0);
  animation: none; /* Uklonjena animacija da citat bude odmah vidljiv */
}
  
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>