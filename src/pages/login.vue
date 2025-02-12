<template>
  <div class="background">
    <LoginCard />
  </div>
</template>

<script setup lang="ts">
import LoginCard from '@/components/login/LoginCard.vue';
</script>

<style scoped>
.background {
  background-image: url('../../public/vei-bg.jpg'); /* Replace with your image path */
  background-size: cover;
  height: 100vh; /* Adjust the height to your needs */
}
</style>