<template>
  <v-card>
    <v-toolbar title="Auspost Ops"></v-toolbar>
    <v-row class="mt-2">
      <v-col>
        <v-text-field v-model="apiKey" label="Auspost API Key" required />
      </v-col>
      <v-col>
        <v-text-field v-model="password" label="Auspost password" required />
      </v-col>
      <v-col>
        <v-text-field v-model="account" label="Auspost Account #" required />
      </v-col>
    </v-row>

    <div class="">
      <v-tabs v-model="tab" color="primary">
        <v-tab prepend-icon="mdi-account" text="Check Account" value="check_account_tab"></v-tab>
        <v-tab prepend-icon="mdi-lock" text="Check Quote" value="check_quote_tab"></v-tab>
      </v-tabs>

      <v-tabs-window v-model="tab">
        <v-tabs-window-item value="check_account_tab">
          <v-card flat>
            <v-card-title>
              <v-btn @click="check_account" color="purple-darken-3" class="mb-2" variant="flat" :disabled="apiKey && password && account ? false : true" persistent>
                  Check Account Details
              </v-btn>
            </v-card-title>
            <v-card-text>
              <v-row class="mb-2" v-if="account_info">
                <vue-json-pretty :data="account_info" showIcon showLuneNumber/>
              </v-row>
            </v-card-text>
          </v-card>
        </v-tabs-window-item>

        <v-tabs-window-item value="check_quote_tab">
          <v-card flat>
            <v-card-text>
              <div v-if="product_codes">
                <v-row>
                  <v-col>
                    <v-text-field v-model="frompostcode" label="From Postcode" required />
                  </v-col>
                  <v-col>
                    <v-text-field v-model="fromsuburb" label="From Suburb" required />
                  </v-col>
                  <v-col>
                    <v-text-field v-model="fromstate" label="From State (XXX)" required />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <v-text-field v-model="topostcode" label="To Postcode" required />
                  </v-col>
                  <v-col>
                    <v-text-field v-model="tosuburb" label="To Suburb" required />
                  </v-col>
                  <v-col>
                    <v-text-field v-model="tostate" label="To State (XXX)" required />
                  </v-col>
                </v-row>
                <v-row>
                  <!-- <v-col>
                    <v-text-field v-model="itemquantity" label="# of parcels" type="number" @input="genarray()" required />
                  </v-col> -->
                  <v-col>
                    <v-select v-model="product_id" label="Product Code" :items="product_codes" item-title="name" item-value="value" required/>
                  </v-col>
                </v-row>
                  <v-row v-for="(item, index) in items" :key="index">
                    <v-col>
                      <v-text-field v-model="item.length" label="Length (cm)" type="number" required />
                    </v-col>
                    <v-col>
                      <v-text-field v-model="item.width" label="Width (cm)" type="number" required />
                    </v-col>
                    <v-col>
                      <v-text-field v-model="item.height" label="Height (cm)" type="number" required />
                    </v-col>
                    <v-col>
                      <v-text-field v-model="item.weight" label="Weight (kg)" type="number" required />
                    </v-col>
                    <v-col >
                      <v-btn @click="delPackage(index)" color="red" class="mt-2" :disabled="index < 1">
                        <v-icon  icon="mdi-delete-forever"></v-icon>
                      </v-btn>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col>
                      <v-btn @click="addPackage" color="green" class="mt-2">
                        <v-icon icon="mdi-plus"></v-icon>
                      </v-btn>
                    </v-col>
                  </v-row>
                <!-- </div> -->
                <v-row class="mt-2">
                  <v-col>
                    <v-btn @click="check_quote" color="purple-darken-3" variant="flat" :disabled="apiKey && password && account ? false : true" persistent>
                      Check Quote
                    </v-btn>
                  </v-col>
                </v-row>
              </div>
              <div v-else>
                Please check the account first!
              </div>
              <vue-json-pretty :data="quote" showIcon showLuneNumber v-if="quote"/>
            </v-card-text>
          </v-card>
        </v-tabs-window-item>
      </v-tabs-window>
    </div>
  </v-card>
</template>

<script setup>
import { ref, reactive } from 'vue'
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';

let apiKey = ref('870d063c-9821-4984-88ba-fefa8570cd6b')
let password = ref('bG2AFOKjrvRcrBfcJA9b')
let account = ref('0005012030')
let account_info = ref('')
let valid = ref(false)
const tab = ref(null)
let frompostcode = ref()
let fromsuburb = ref()
let fromstate = ref()
let topostcode = ref()
let tosuburb = ref()
let tostate = ref()
let itemquantity = ref(1)
let product_codes = ref(undefined)
let product_id = ref('')
let quote = ref(undefined)
let length = ref('')
let width = ref('')
let height = ref('')
let weight = ref ('')
// let items = ref([{length: 1, width: 1, height: 1, weight: 1, product_id: product_id}])
let items = reactive([
  { length: 0, width: 0, height: 0, weight: 0, product_id: product_id.value }
])

const check_account = async () => {
  if (account.value && apiKey.value && password.value) {
    const bearer = btoa(`${apiKey.value}:${password.value}`)
    const response = await fetch(`/auspost/shipping/v1/accounts/${account.value}`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Account-Number': account.value,
        'Content-Type': 'application/json',
        'Authorization': `Basic ${bearer}`,
        'user-agent': 'JS Fetch',
        'x-shippit-platform': 'Shippit Support Black Ops'
      }
    }).then((res) => res.json())
    account_info.value = response
    product_codes.value = response.postage_products.map(item => {
      return { name: `${item.type} -> ${item.product_id}`, value: item.product_id }
    })
  }
}

const check_quote = async () => {
  if (account.value && apiKey.value && password.value) {
    const bearer = btoa(`${apiKey.value}:${password.value}`)
    const body = {shipments: [
          { from: { postcode: frompostcode.value, suburb: fromsuburb.value, state: fromstate.value.toUpperCase()},
            to: { postcode: topostcode.value, suburb: tosuburb.value, state: tostate.value.toUpperCase()},
            items:  items.map(item => ({length: item.length, width: item.width, height: item.height, weight: item.weight, product_id: item.product_id}))
          }
        ]}
    console.log(body)
    const response = await fetch('/auspost/shipping/v1/prices/shipments', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Account-Number': account.value,
        'Content-Type': 'application/json',
        'Authorization': `Basic ${bearer}`,
        'user-agent': 'JS Fetch',
        'x-shippit-platform': 'Shippit Support Black Ops'
      },
      body: JSON.stringify(body)
    }).then((res) => res.json())
    quote.value = response
  }
}

const addPackage = () => {
  items.push({length: 0, width: 0, height: 0, weight: 0, product_id: ''});
}

const delPackage = (index) => {
  items.splice(index,1);
}
</script>
