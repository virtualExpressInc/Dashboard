<template>
  <v-container class="pa-8">
    <!-- Loading Overlay -->
    <v-overlay v-model="loading" class="loader">
      <v-card variant="plain">
        <v-card-text>
          <v-img :src="logoLoading" alt="LogoLoad" class="mb-2"></v-img>
          <span>
            <b class="text-white">Loading... Thank you for your patience.</b>
          </span>
        </v-card-text>
      </v-card>
    </v-overlay>

    <!-- Login Form -->
    <v-row justify="center">
      <v-col cols="12" sm="10" md="6" lg="5">
        <v-card class="elevation-12 custom-card">
          <v-card-text class="pa-6">
            <v-img :src="logo" alt="Logo" contain max-height="200" class="mb-4"></v-img>
            <v-card variant="tonal" color="error" v-if="isError">
              <v-card-text>
                Invalid username or password
              </v-card-text>
            </v-card>
            <v-toolbar flat class="transparent-toolbar">
              <v-toolbar-title class="text-center">Log into your account</v-toolbar-title>
            </v-toolbar>
            <v-form @submit.prevent="login">
              <!-- Email Field -->
              <v-text-field
                v-model="email"
                label="Email"
                name="email"
                prepend-icon="mdi-email"
                type="email"
                variant="outlined"
                density="compact"
                class="mb-4"
                required
              ></v-text-field>

              <!-- Password Field -->
              <v-text-field
                v-model="password"
                label="Password"
                name="password"
                prepend-icon="mdi-lock"
                type="password"
                variant="outlined"
                density="compact"
                class="mb-2"
                required
              ></v-text-field>

              <!-- Login Button -->
              <v-btn color="primary" type="submit" block class="mb-4">
                Login
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import logo from '@/assets/vei-logo-black.png';
import logoLoading from '@/assets/vei-loading.gif';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const loading = ref(false); // Loading state
const router = useRouter();
const isError = ref(false)
// Static credentials for login
const staticEmail = 'timetracker@virtualexpressinc.com';
const staticPassword = 'v1rtu@l3xpRess1nC2025!';

// Login function
const login = () => {
  // Set loading to true to show the overlay
  loading.value = true;

  // Simulate a delay for authentication
  setTimeout(() => {
    // Check if the provided email and password are correct
    if (email.value === staticEmail && password.value === staticPassword) {
      // Authentication successful, set the authentication flag in localStorage
      localStorage.setItem('isAuthenticated', 'true');

      // Redirect to the home page (or any protected page)
      router.push('/');
    } else {
      // Authentication failed, show an alert or error message
      alert('Invalid email or password');
      isError.value = true
      // Hide the loading overlay
      loading.value = false;
    }
  }, 3000); // Simulate a 3-second delay
};
</script>

<style scoped>
.v-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Custom Card Styles */
.custom-card {
  height: 100%;
  display: flex;
  padding: 24px;
}

/* Transparent Toolbar */
.transparent-toolbar {
  background-color: transparent !important;
  padding-bottom: 0px;
  margin-bottom: 0px;
}

.loader {
  background-color: rgba(0, 0, 0, 0.6); /* Semi-transparent background */
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
