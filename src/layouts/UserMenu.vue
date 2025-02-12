<template>
  <div class="text-center">
    <v-menu
      v-model="menu"
      :close-on-content-click="false"
      location="end"
    >
      <template v-slot:activator="{ props }">
        <v-btn icon variant="text">
          <v-avatar v-bind="props">
            <v-img
              alt="UserProfile"
              src="https://cdn.vuetifyjs.com/images/john.jpg"
            ></v-img>
          </v-avatar>
        </v-btn>
      </template>

      <v-card min-width="300">
        <v-list>
          <v-list-item
            prepend-avatar="https://cdn.vuetifyjs.com/images/john.jpg"
            subtitle="Employee"
            title="John Doe"
          >
            <template v-slot:append>
              <v-btn
                :class="fav ? 'text-red' : ''"
                icon="mdi-cog"
                variant="text"
                @click="fav = !fav"
              ></v-btn>
            </template>
          </v-list-item>
        </v-list>

        <v-divider></v-divider>

        <v-list>
          <v-list-item>
            <v-switch
              v-model="message"
              color="purple"
              label="Enable messages"
              hide-details
            ></v-switch>
          </v-list-item>

          <v-list-item>
            <v-switch
              v-model="hints"
              color="purple"
              label="Enable hints"
              hide-details
            ></v-switch>
          </v-list-item>
          <v-divider />
            <!-- Logout Button -->
            <v-list-item @click="logout">
              <v-icon class="mr-2">mdi-logout</v-icon>
              Logout
            </v-list-item>
        </v-list>
      </v-card>
    </v-menu>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const menu = ref(false)
const fav = ref(true)
const message = ref(false)
const hints = ref(true)
const router = useRouter();

// Logout Function
const logout = () => {
  console.log("Logging out...");
  
  // Clear the authentication state from localStorage
  localStorage.removeItem('isAuthenticated');
  
  // Optionally, you can also clear other sensitive data (e.g., user data) from localStorage if needed
  
  // Redirect the user to the login page
  router.push("/login");
};

</script>
