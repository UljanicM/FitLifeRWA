<template>
  <q-page class="q-pa-md lg:q-pa-lg">
    <div class="row justify-center">
      <div style="width: 100%; max-width: 1100px;">
        <q-card flat bordered class="bg-white">

          <q-card-section>
            <div class="text-h3 text-weight-bolder text-primary text-center">
              O nama
            </div>
          </q-card-section>
          
          <q-separator />
          <q-card-section>
            <div class="row q-col-gutter-xl q-pt-md">

              <div class="col-12 col-md-7">
                <div class="text-h5 text-weight-bold text-grey-8 q-mb-md">Naša Misija</div>
                <p class="text-body1 text-grey-7" style="line-height: 1.7;">
                  {{ o_nama }}
                </p>
                <p class="text-body1 text-grey-7" style="line-height: 1.7;">
                  Vjerujemo da svatko zaslužuje pristup kvalitetnim informacijama i alatima koji će im pomoći na putu prema zdravijem životu. Bilo da ste početnik koji tek ulazi u svijet fitnessa ili iskusan vježbač, naša platforma nudi personalizirane planove treninga i prehrane, mogućnost suradnje s certificiranim trenerima i zajednicu koja vas podržava.
                </p>
              </div>

              <div class="col-12 col-md-5">
                
                <div class="text-h5 text-weight-bold text-grey-8 q-mb-md">Kontaktirajte Nas</div>
                <q-list separator>
                  <q-item>
                    <q-item-section avatar>
                      <q-icon color="primary" name="email" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Email</q-item-label>
                      <q-item-label caption>
                        <a href="mailto:info@fitlife.com" class="text-primary" style="text-decoration: none;">info@fitlife.com</a>
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section avatar>
                      <q-icon color="primary" name="phone" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Broj mobitela</q-item-label>
                      <q-item-label caption>+385 99 123 4567</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>

                <q-separator class="q-my-lg" />
                
                <div class="text-h5 text-weight-bold text-grey-8 q-mb-md">Prototip Aplikacije</div>
                <p class="text-body2 text-grey-7">
                  Istražite tehnički koncept naše aplikacije preuzimanjem originalne prototip skripte razvijene za komandnu liniju.
                </p>
                <q-btn
                  color="secondary"
                  icon="download"
                  label="Preuzmi .sh skriptu"
                  class="full-width"
                  type="a"
                  href="/scripts/fitlife-prototip.sh"
                  download
                />

              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const o_nama = ref('Fitlife je aplikacija posvećena praćenju vašeg napretka u teretani, planiranju treninga i prehrane. Naš cilj je pomoći vam da ostvarite svoje fitness ciljeve na jednostavan i učinkovit način.')
</script>

<style scoped>
.text-primary {
  font-weight: 500;
}
</style>