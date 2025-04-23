<template>
  <div>
    <v-row>
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4 d-flex align-center" elevation="2">
          <v-avatar class="me-3" size="48" color="primary">
            <v-icon size="30" color="white">mdi-domain</v-icon>
          </v-avatar>
          <div>
            <v-card-title class="text-subtitle-1">Total Workspaces</v-card-title>
            <v-card-subtitle v-if="!loading" class="text-h6 font-weight-bold">{{ totalWorkspaces }}</v-card-subtitle>
            <v-progress-linear
            v-else
            color="primary"
            height="6"
            indeterminate
            rounded
          ></v-progress-linear>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4 d-flex align-center" elevation="2">
          <v-avatar class="me-3" size="48" color="primary">
            <v-icon size="30" color="white">mdi-account-multiple</v-icon>
          </v-avatar>
          <div>
            <v-card-title class="text-subtitle-1">Total Users</v-card-title>
            <v-card-subtitle v-if="!loading" class="text-h6 font-weight-bold">{{ totalUsers }}</v-card-subtitle>
            <v-progress-linear
            v-else
            color="primary"
            height="6"
            indeterminate
            rounded
          ></v-progress-linear>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4 d-flex align-center" elevation="2">
          <v-avatar class="me-3" size="48" color="primary">
            <v-icon size="30" color="white">mdi-cash</v-icon>
          </v-avatar>
          <div>
            <v-card-title class="text-subtitle-1">Hourly Billables</v-card-title>
            <v-card-subtitle v-if="!loading"  class="text-h6 font-weight-bold">₱{{ moneyFormat(totalHourlyBillable) }}/ hr</v-card-subtitle>
            <v-progress-linear
              v-else
              color="primary"
              height="6"
              indeterminate
              rounded
            ></v-progress-linear>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4 d-flex align-center" elevation="2">
          <v-avatar class="me-3" size="48" color="primary">
            <v-icon size="30" color="white">mdi-account-check</v-icon>
          </v-avatar>
          <div>
            <v-card-title class="text-subtitle-1">Total Online Users</v-card-title>
            <v-card-subtitle v-if="!loading" class="text-h6 font-weight-bold">{{ totalOnlineUsers }}</v-card-subtitle>
            <v-progress-linear
              v-else
              color="primary"
              height="6"
              indeterminate
              rounded
            ></v-progress-linear>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { useWorkspaces } from '@/hooks/workspace/useGetAllWorkspace';
import { ref, onMounted, computed } from 'vue';
import { currencyFormat } from '@/helpers/currencyFormat';
import { moneyFormat } from '@/helpers/moneyFormat';

// Total values for cards
const totalBillables = ref(0);

// UseWorkspaces hook
const { workspaces, loading, error, fetchWorkspaces, totalUsers, totalWorkspaces, totalHourlyBillable } = useWorkspaces();


const allMembers = ref<any[]>([]);


const totalOnlineUsers = computed(() => {
  return allMembers.value.filter(user => user.status === 'ACTIVE').length;
});


onMounted(async () => {
  await fetchWorkspaces();

});
</script>


<style scoped>
.v-card {
  border-radius: 12px;
}
.v-avatar {
  background-color: #1976D2; /* Vuetify primary color */
}
.v-card-title {
  font-size: 14px;
  color: #666;
}
.v-card-subtitle {
  color: #333;
}
</style>
