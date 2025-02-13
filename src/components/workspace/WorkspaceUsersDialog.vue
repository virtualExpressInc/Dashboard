<template>
  <v-dialog v-model="props.openDialog" max-width="600px">
    <v-card>
      <v-card-title>
        {{ workspace?.name }} - Members
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="6">
            <v-text-field
              variant="outlined"
              density="compact"
              v-model="startDate"
              label="Start Date"
              type="date"
              @change="onchangeDate"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              variant="outlined"
              density="compact"
              v-model="endDate"
              label="End Date"
              type="date"
              @change="onchangeDate"
            />
          </v-col>
        </v-row>
      </v-card-text>
      <div v-if="loading" class="text-center">
        <v-progress-circular color="primary" indeterminate />
      </div>
      <v-table v-if="users?.length">
        <thead>
          <tr>
            <th class="text-left">Name</th>
            <th class="text-left">Time Tracked</th>
            <th class="text-left">Billable</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>
              <v-avatar size="40">
                <v-img v-if="user.profilePicture" :src="user.profilePicture" alt="User Avatar" />
                <span v-else class="avatar-placeholder">{{ user.name.charAt(0).toUpperCase() }}</span>
              </v-avatar>
              {{ user.name }}
            </td>
            <td>
              {{ parseClockifyDuration(userData?.find(item => item.user.id === user.id)?.totalTime || "PT0S") }}
            </td>
            <td></td>
          </tr>
        </tbody>
      </v-table>
      <v-alert v-if="!loading && users?.length === 0" type="info">No members found.</v-alert>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="$emit('close')">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useUsersByWorkspace } from '@/hooks/user/useGetAllUsersByWorkspace';
import { useGetUserData } from '@/hooks/user/useGetUserData';
import { defineProps, computed, watchEffect, ref, onMounted } from 'vue';
import { parseClockifyDuration } from '@/helpers/exractTime';

const props = defineProps<{
  openDialog: boolean;
  workspace: { id: string; name: string; memberships: Array<{ id: string; name: string }> } | null;
}>();

const startDate = ref(new Date().toISOString().split("T")[0]);
const endDate = ref(new Date().toISOString().split("T")[0]);

const payload = computed(() => ({
  start: startDate.value + "T00:00:00.000Z",
  end: endDate.value + "T23:59:59.999Z",
  type: "PROJECT",
  sortOrder: "DESCENDING",
  sortColumn: "LATEST_ACTIVITY",
  page: 1,
  pageSize: 50
}));

const { users, error, loading, fetchUsersByWorkspace } = useUsersByWorkspace(String(props?.workspace?.id));
const { users: userData, error: errorUserData, loading: loadingUserData, fetchUserData } = useGetUserData(String(props?.workspace?.id), payload.value);

onMounted(() => {
  fetchUsersByWorkspace();
  fetchUserData(payload.value);
});

// Automatically refetch when payload changes
watchEffect(() => {
  fetchUserData(payload.value);
});

const onchangeDate = () => {
  console.log("Date changed!", startDate.value, endDate.value);
};
</script>
