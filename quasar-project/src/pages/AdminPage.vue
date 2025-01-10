<template>
  <q-page class="flex flex-center">
    <img
      alt="Fitlife logo"
      src="~assets/Fitlife.png"
      class="my-image animate-image"
    />
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