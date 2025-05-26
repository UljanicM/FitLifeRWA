<template>
  <q-page padding>
    <div class="q-pa-md">
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="text-h5 q-mb-md">Popis Vježbi</div>
          <q-input
            v-model="searchTerm"
            label="Pretraži po nazivu, kategoriji ili težini"
            outlined
            clearable
            dense
            @update:model-value="filterExercises"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </q-card-section>
      </q-card>

      <q-list bordered separator v-if="filteredExercises.length > 0">
        <q-item v-for="exercise in filteredExercises" :key="exercise.id" clickable v-ripple>
          <q-item-section avatar>
            <q-avatar color="purple" text-color="white" icon="fitness_center" />
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-h6">{{ exercise.name }}</q-item-label>
            <q-item-label caption>Kategorija: {{ exercise.category }}</q-item-label>
            <q-item-label caption>Težina: {{ exercise.difficulty }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <q-card v-else-if="!loading" flat bordered class="q-mt-md">
        <q-card-section class="text-center text-grey-7">
          Nema pronađenih vježbi.
        </q-card-section>
      </q-card>

      <q-inner-loading :showing="loading">
        <q-spinner-gears size="50px" color="purple" />
        <p class="q-mt-md">Učitavanje vježbi...</p>
      </q-inner-loading>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useQuasar } from 'quasar';

const $q = useQuasar();

const exercises = ref([]);
const searchTerm = ref('');
const loading = ref(true);

const filteredExercises = computed(() => {
  if (!searchTerm.value) {
    return exercises.value;
  }
  const lowerCaseSearchTerm = searchTerm.value.toLowerCase();
  return exercises.value.filter(exercise =>
    (exercise.name && exercise.name.toLowerCase().includes(lowerCaseSearchTerm)) ||
    (exercise.category && exercise.category.toLowerCase().includes(lowerCaseSearchTerm)) ||
    (exercise.difficulty && exercise.difficulty.toLowerCase().includes(lowerCaseSearchTerm))
  );
});

const fetchExercises = async () => {
  loading.value = true;
  try {
    const response = await axios.get('http://localhost:3000/api/vjezbe');
    exercises.value = response.data || [];
    // $q.notify({ // Uklonjeno: Notifikacija za uspješno učitavanje
    //   type: 'positive',
    //   message: 'Vježbe uspješno učitane!',
    //   position: 'top'
    // });
  } catch (error) {
    console.error('Greška pri dohvaćanju vježbi:', error);
    $q.notify({
      type: 'negative',
      message: 'Greška pri učitavanju liste vježbi.',
      position: 'top'
    });
  } finally {
    loading.value = false;
  }
};

const filterExercises = () => {
  // Filtriranje se događa automatski putem computed property 'filteredExercises'
};

onMounted(() => {
  fetchExercises();
});
</script>

<style scoped>
.my-card {
  max-width: 700px;
  margin: auto;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}
</style>
