<template>
  <div>
    <v-row>
      <!-- Total Workspaces -->
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4 d-flex align-center" elevation="2">
          <v-avatar class="me-3" size="48" color="primary">
            <v-icon size="30" color="white">mdi-domain</v-icon>
          </v-avatar>
          <div>
            <v-card-title class="text-subtitle-1">Total Workspaces</v-card-title>
            <v-card-subtitle v-if="!loading" class="text-h6 font-weight-bold">{{ totalWorkspaces }}</v-card-subtitle>
            <v-progress-linear v-else color="primary" height="6" indeterminate rounded></v-progress-linear>
          </div>
        </v-card>
      </v-col>

      <!-- Total Users -->
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4 d-flex align-center" elevation="2">
          <v-avatar class="me-3" size="48" color="primary">
            <v-icon size="30" color="white">mdi-account-multiple</v-icon>
          </v-avatar>
          <div>
            <v-card-title class="text-subtitle-1">Total Users</v-card-title>
            <v-card-subtitle v-if="!loading" class="text-h6 font-weight-bold">{{ totalUsers }}</v-card-subtitle>
            <v-progress-linear v-else color="primary" height="6" indeterminate rounded></v-progress-linear>
          </div>
        </v-card>
      </v-col>

      <!-- Hourly Billables -->
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4 d-flex align-center" elevation="2">
          <v-avatar class="me-3" size="48" color="primary">
            <v-icon size="30" color="white">mdi-cash</v-icon>
          </v-avatar>
          <div>
            <v-card-title class="text-subtitle-1">Hourly Billables</v-card-title>
            <v-card-subtitle v-if="!loading" class="text-h6 font-weight-bold">
              ₱{{ moneyFormat(totalHourlyBillable) }}/ hr
            </v-card-subtitle>
            <v-progress-linear v-else color="primary" height="6" indeterminate rounded></v-progress-linear>
          </div>
        </v-card>
      </v-col>

      <!-- Total Online Users -->
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4 d-flex align-center" elevation="2">
          <v-avatar class="me-3" size="48" color="primary">
            <v-icon size="30" color="white">mdi-account-check</v-icon>
          </v-avatar>
          <div>
            <v-card-title class="text-subtitle-1">Total Online Users</v-card-title>
            <v-card-subtitle v-if="!loading" class="text-h6 font-weight-bold">{{ totalOnlineUsers }}</v-card-subtitle>
            <v-progress-linear v-else color="primary" height="6" indeterminate rounded></v-progress-linear>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { useWorkspaces } from '@/hooks/workspace/useGetAllWorkspace';
import { computed, onMounted } from 'vue';
import { moneyFormat } from '@/helpers/moneyFormat';
import { watch } from 'vue';


const props = defineProps<{
  allMembers: any[];
}>();

// Workspace stats
const { loading, fetchWorkspaces, totalUsers, totalWorkspaces, totalHourlyBillable } = useWorkspaces();

// Compute online users dynamically from allMembers prop
const totalOnlineUsers = computed(() => {
  return props.allMembers.filter(user => user.status === 'ACTIVE').length;
});

// Fetch workspace stats when mounted
onMounted(async () => {
  await fetchWorkspaces();
});

watch(() => props.allMembers, (newVal) => {
  console.log("🟢 CountCards received new allMembers prop:", newVal);
  console.log("🟢 Total Online Users Count:", totalOnlineUsers.value);
}, { deep: true });
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
