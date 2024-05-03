<template>
  <v-app id="inspire">
    <SystemBar/>
    <NavigationDrawer/>
    <v-main>
      <v-container class="py-8 px-6" fluid >
        <RouterView/>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
  import SystemBar from '@/components/SystemBar.vue'
  import NavigationDrawer from '@/components/NavigationDrawer.vue'

  import { RouterView } from 'vue-router';
  
</script>