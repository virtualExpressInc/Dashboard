<template>
  <div class="app-bar">
    <v-app-bar :elevation="0" border color="#1f2943">
      <v-app-bar-title>
      </v-app-bar-title>
      <user-menu class="float-right mr-4" />
    </v-app-bar>
  </div>
</template>

<script lang="ts" setup>
import UserMenu from './UserMenu.vue';

</script>
