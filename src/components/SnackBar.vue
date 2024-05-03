<template>
    <div class="text-center">
        <v-snackbar v-model="snackbar" :timeout="5000" multi-line >
            <slot></slot>
        </v-snackbar>
    </div>
</template>

<script setup>
import { ref } from 'vue';
const props = defineProps([
    'state'
])
    let snackbar = ref(state)
</script>