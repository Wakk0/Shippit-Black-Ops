<template>
    <v-navigation-drawer v-model="drawer">
        <v-sheet class="pa-4" color="purple-darken-4">
            <v-avatar class="mb-4" color="purple-darken-4" size="64">
                <v-img :src="logo" />
            </v-avatar>
            <div>Shippit Black Ops</div>
        </v-sheet>

        <v-divider></v-divider>

        <v-list color="purple-darken-3">
            <v-list-item v-for="[icon, text, url] in links" :key="icon" :prepend-icon="icon" :title="text" :to="url" link></v-list-item>
        </v-list>
    </v-navigation-drawer>

</template>

<script setup>
    import { ref } from 'vue'
    import logo from '@/assets/logo.png'

    const links = [
        ['mdi-home','Home','/'],
        ['mdi-inbox-arrow-down', 'Bulk Deletion', '/bulkdelete'],
        ['mdi-send', 'Auspost Ops', '/auspostops'],
        // ['mdi-send', 'Form Test', '/formtest'],
        // ['mdi-alert-octagon', 'Spam'],
    ]

    let drawer = ref(true)
</script>