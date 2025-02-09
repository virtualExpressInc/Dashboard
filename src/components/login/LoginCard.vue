<template>
            <v-img
                :src="logo"
                alt="Logo"
                contain
                max-height="100"
                class="mb-4">
            </v-img>

        <v-toolbar flat class="transparent-toolbar">
            <v-toolbar-title class="text-center">Log into your account </v-toolbar-title>
        </v-toolbar>
    <v-container class="pa-8">
        <v-row justify="center">
            <v-col cols="12" sm="10" md="8" lg="6"> <!-- Increased column width -->
                <v-card class="elevation-12 custom-card"> <!-- Added custom-card class -->
                    <v-card-text class="pa-6">
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

                                <!-- Remember Me Checkbox -->
                                <v-checkbox
                                    v-model="rememberMe"
                                    label="Remember Me"
                                ></v-checkbox>
            
                            <!-- Login Button -->
                            <v-btn color="primary" type="submit" block class="mb-4">Login</v-btn>
                        </v-form>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>
  
  <script setup>
  import { ref } from 'vue';
  import logo from '@/assets/vei-icon.png';
  import { useRouter } from 'vue-router';
  
  const email = ref('');
  const password = ref('');
  const rememberMe = ref(false);
  const router = useRouter(); 
  
//   const login = () => {
//     console.log('Logging in with:', email.value, password.value);
//   };

// For redirection only
  const login = () => {
    router.push('/');
    };
  </script>
  
  <style scoped>

    .v-container {
        height: 100%; /* Full viewport height */
        display: flex;
        align-items: center; /* Center content vertically */
        justify-content: center; /* Center content horizontally */
    }

    /* Custom Card Styles */
    .custom-card {
        height: 100%; /* Full height */
        display: flex;
        padding: 24px;
    }   

      /* Transparent Toolbar */
    .transparent-toolbar {
        background-color: transparent !important; /* Make toolbar background transparent */
        padding-bottom: 0px;
        margin-bottom: 0px;
    }

    .v-img {
        margin-top: 16px;
    }

  </style>