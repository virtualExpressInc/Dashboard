<template>
  <v-app>
    <!-- The overlay to display loading spinner -->
    <v-overlay :value="loading" absolute>
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
        width="6"
      ></v-progress-circular>
    </v-overlay>

    <!-- Content of your page -->
    <v-container>
      <v-btn @click="toggleLoading">Toggle Loading</v-btn>
      <div>
        <!-- Your page content goes here -->
        <p>This is your content</p>
      </div>
    </v-container>
  </v-app>
</template>

<script setup>
import { ref } from 'vue';

// State to control the loading overlay visibility
const loading = ref(false);

// Function to toggle loading state
const toggleLoading = () => {
  loading.value = !loading.value;
};
</script>

<style scoped>
/* You can add custom styles if needed */
</style>
