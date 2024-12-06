<template>
  <v-form v-model="valid">
    <v-row>
      <v-col>
        <v-card
          color="#E1BEE7"
          title="Read before use"
        >
          <v-card-text>
            This tool is designed for bulk deletions when the action cannot be performed by date (found at the bottom of the store admin page). It's important to consider the API rate limit set by the merchant, which defaults to 60 per minute. If you're deleting multiple orders, it could strain resources and affect other merchants. In such cases, please delete orders in reasonable batches. For orders that fail to cancel, please refer to this <a href='https://shippit.atlassian.net/wiki/spaces/FUL/pages/2575564923/Deleting+cancelling+orders'>Confluence Article</a>.<br><br>
            The CSV provided will take into account ONLY the header "order" expecting the shippit tracking number (starts with pp...).
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-select
          v-model="environment"
          label="Select environment"
          :items="envItems"
          item-title="text"
          item-value="value"
          required
        />
      </v-col>
      <v-col>
        <v-text-field v-model="apiKey" label="API Key" required />
      </v-col>
      <v-col>
        <v-btn
          @Click="check_merchant"
          color="purple-darken-3"
          :disabled="environment && apiKey ? false : true"
          >Check merchant</v-btn
        >
      </v-col>
    </v-row>
    <v-row v-if="showStoreDetails" class="pa-2">
      <v-col>
        <v-alert title="Store Details:" color="purple-lighten-4"> {{ merchant_info }}</v-alert>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-file-input
          v-model="csvFile"
          @change="onFileChange"
          label="CSV upload"
          accept=".csv"
          required
        />
      </v-col>
      <!-- <v-col>
        <v-text-field v-model="delayInMs" :label="`Delay in ms - ${delayInMs/1000}s`" required />
      </v-col> -->
      <v-col>
        <v-btn
          color="purple-darken-3"
          variant="flat"
          :disabled="apiKey && csvFile && environment ? false : true"
          persistent
        >
          Bulk Delete
          <v-dialog max-width="500" activator="parent">
            <template v-slot:default="{ isActive }">
              <v-card title="Sorry Whaaaaat?">
                <v-card-text>
                  You are about to cancel {{ orders.length }} orders. Are you sure you want to
                  proceed?
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    text="Yes"
                    @click="isActive.value = bulkDeleteOrders()"
                    color="green" flat
                  ></v-btn>
                  <v-btn text="No" @click="isActive.value = !isActive.value" color="red"></v-btn>
                </v-card-actions>
              </v-card>
            </template>
          </v-dialog>
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col >
        <v-data-table
          v-if="orders.length > 0"
          :headers="tableHeaders"
          :items="orders"
          class="elevation-6"
          density="compact"
          :sort-by="[{ key: 'id', order: 'asc' }]"
        >
          <template v-slot:item.action="{ item }">
            <v-icon color="red" @click="deleteOrder(item)" size="small">mdi-delete</v-icon>
          </template>
          <template v-slot:item.message="{ item }">
            <v-dialog v-if="item.message">
              <template v-slot:activator="{ props: activatorProps }">
                <v-btn
                  v-bind="activatorProps"
                  :color="item.message.error ? 'red' : 'green'"
                  text="Show Response"
                  size="small"
                  variant="flat"
                  :disabled="!item.message"
                ></v-btn>
              </template>
              <template v-slot:default="{ isActive }">
                <v-card title="Message">
                  <v-card-text>
                    {{ item.message }}
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text="Close" @click="isActive.value = false"></v-btn>
                  </v-card-actions>
                </v-card>
              </template>
            </v-dialog>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-form>
  <div class="text-center">
    <v-snackbar v-model="snackbar" :timeout="5000" color="red-darken-3" multi-line>
      <strong>{{ SnackBarErrorMessage }}</strong>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import csv from 'csvtojson'

let environment = ref(undefined)
let apiKey = ref('')
let csvFile = ref(null)
let merchant_info = reactive({})
let valid = ref(false)
let showStoreDetails = ref(false)
let orders = ref([])
let snackbar = ref(false)
let SnackBarErrorMessage = ref('')
let delayInMs = ref(300)

const envItems = [
  { text: 'Select', value: null },
  { text: 'Staging', value: 'staging' },
  { text: 'Production', value: 'production' }
]
const tableHeaders = [
  { title: 'ID', key: 'id' },
  { title: 'Order', key: 'order' },
  { title: 'Status', key: 'status' },
  { title: 'Message', key: 'message' },
  { title: 'Action', key: 'action' }
]

const check_merchant = async () => {
  if (environment.value && apiKey.value) {
    const response = await fetch(`${environment.value}/merchant`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.value}`,
        'user-agent': 'node Fetch',
        'x-shippit-platform': 'Shippit Supoprt Black Ops'
      }
    }).then((res) => res.json())
    merchant_info = response.response
    showStoreDetails.value = true
    console.log(merchant_info)
  } else {
    SnackBarErrorMessage.value = 'Please select the environment or add the API key!'
    snackbar.value = true
  }
}

const deleteOrder = async(item) => {
  if (environment.value && apiKey.value) {
    const request = await fetch(`${environment.value}/orders/${item.order}`, {
    method: 'DELETE',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey.value}`,
      'user-agent': 'node Fetch',
      'x-shippit-platform': 'Shippit Support Black Ops'
    }
    }).then((res) => res.json())

  const response = request.response
  if (response) {
    Object.assign(orders.value[orders.value.indexOf(item)], {
      ...item,
      status: response.state,
      message: response
    })
  } else {
    Object.assign(orders.value[orders.value.indexOf(item)], {
      ...item,
      status: request.order_state ?? 'unknown',
      message: request
    })
  }
  } else {
    SnackBarErrorMessage.value = 'Please select the environment or add the API key!'
    snackbar.value = true
  }
}

const onFileChange = async (e) => {
  const reader = new FileReader()
  const csvFile = e.target.files[0]
  reader.onload = (evnt) => {
    csv()
      .fromString(evnt.target.result)
      .then((json) => {
        orders.value = json.map((reg, index) => {
          return { ...reg, id: index, status: 'unknown', message: '' }
        })
      })
  }

  await reader.readAsText(csvFile)
}

const bulkDeleteOrders = () => {
  orders.value.map(
    (order) => deleteOrder(order))
  return false
}
</script>
