<template>
  <v-app>
    <side-bar />
    <nav-bar />
    <default-view />
  </v-app>
</template>

<script lang="ts" setup>
import { watch, ref } from 'vue';
import NavBar from './AppBar.vue'
import SideBar from './SideBar.vue'
import DefaultView from './View.vue'
</script>
