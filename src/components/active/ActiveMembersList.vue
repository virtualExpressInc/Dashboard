<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card class="rounded-lg" variant="flat" style="border: 1px solid #eee;">
          <!-- Section Header -->
          <v-card-text class="px-6 pt-6 pb-2">
            <h4 class="text-h6 font-weight-medium mb-2">Member List</h4>
          </v-card-text>

          <!-- Filter -->
          <v-card-text class="px-6 pt-0 pb-4">
            <v-select
              v-model="selectedWorkspace"
              :items="workspaceOptions"
              label="Filter by Workspace"
              item-title="name"
              item-value="id"
              clearable
              dense
              variant="outlined"
              style="max-width: 300px"
            />
          </v-card-text>

          <!-- Custom Table Header -->
          <div
            class="d-flex px-6 py-3"
            style="background-color: #FFFFFF !important; color: #2e2e2e; font-weight: 500; border-top: 1px solid #e0e0e0; border-bottom: 1px solid #e0e0e0;"
          >
            <div style="width: 50%; min-width: 240px;">Name</div>
            <div style="width: 35%;">Workspace</div>
            <div style="width: 15%;">Status</div>
          </div>

          <!-- Table Body -->
          <v-data-table
            :headers="headers"
            :items="filteredMembers"
            :loading="loading"
            class="elevation-0"
            hide-default-header
            :item-value="item => `${item.email}-${item.workspaceId}`"
          >
            <template v-slot:item="{ item }">
              <div class="d-flex px-6 py-3 align-center" style="border-bottom: 1px solid #eee;">
                <!-- Name -->
                <div style="width: 50%; min-width: 240px;">
                  <div>{{ item.name }}</div>
                  <div class="text-caption">{{ item.email }}</div>
                </div>

                <!-- Workspace -->
                <div style="width: 35%;">{{ item.workspace }}</div>

                <!-- Status -->
                <div style="width: 15%;">
                  <v-icon
                    :color="item.status === 'ACTIVE' ? 'green' : 'grey'"
                    size="small"
                    class="mr-1"
                  >mdi-checkbox-blank-circle</v-icon>
                  <span>{{ item.status === 'ACTIVE' ? 'Tracking' : 'Idle' }}</span>
                </div>
              </div>
            </template>
          </v-data-table>

          <!-- No Data Message -->
          <v-alert
            v-if="!loading && filteredMembers.length === 0"
            type="info"
            class="mt-4 mx-6 mb-6"
          >
            No members found.
          </v-alert>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useWorkspaces } from '@/hooks/workspace/useGetAllWorkspace';
import { getAllUsersByWorkspace } from '@/services/user.services';
import api from '../../axiosInstance/index';

const { workspaces, fetchWorkspaces } = useWorkspaces();
const loading = ref(true);
const allMembers = ref<any[]>([]);
const selectedWorkspace = ref<string | null>(null);

const headers = [
  { text: 'Name', value: 'name' },
  { text: 'Workspace', value: 'workspace' },
  { text: 'Status', value: 'status' }
];

const workspaceOptions = computed(() => {
  const dynamicOptions = (workspaces.value || []).map(ws => ({
    name: ws.name,
    id: ws.id
  }));
  return [{ name: 'All Workspaces', id: 'ALL' }, ...dynamicOptions];
});

const filteredMembers = computed(() => {
  if (!selectedWorkspace.value || selectedWorkspace.value === 'ALL') {
    return allMembers.value;
  }
  return allMembers.value.filter(member => member.workspaceId === selectedWorkspace.value);
});

const isUserTimerRunning = async (workspaceId: string, userId: string): Promise<boolean> => {
  try {
    const { data } = await api.get(
      `workspaces/${workspaceId}/user/${userId}/time-entries?in-progress=true`
    );
    return data.length > 0 && data[0].timeInterval?.end === null;
  } catch (error) {
    console.error(`⛔ Error checking timer for user ${userId} in workspace ${workspaceId}:`, error);
    return false;
  }
};

    onMounted(async () => {
      const cacheKey = 'activeMembersCache';
      const cacheTTL = 1000 * 60 * 5; // 5 minutes

      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          const age = Date.now() - parsed.timestamp;

          if (age < cacheTTL) {
            allMembers.value = parsed.data;
            console.log("✅ Loaded members from localStorage cache");
            loading.value = false;
            return;
          }
        } catch (e) {
          console.warn("⚠️ Failed to parse localStorage cache:", e);
        }
      }

      await fetchWorkspaces();

      if (!workspaces.value || workspaces.value.length === 0) {
        loading.value = false;
        return;
      }

      const userMap = new Map<string, any>();

      for (const workspace of workspaces.value) {
        try {
          const users = await getAllUsersByWorkspace(workspace.id);

          const userChecks = users.map(async (user: any) => {
            const uniqueKey = `${user.email}-${workspace.id}`;
            if (!userMap.has(uniqueKey)) {
              const isRunning = await isUserTimerRunning(workspace.id, user.id);

              userMap.set(uniqueKey, {
                name: user.name,
                email: user.email,
                profilePicture: user.profilePicture || null,
                workspace: workspace.name,
                workspaceId: workspace.id,
                status: isRunning ? 'ACTIVE' : 'INACTIVE'
              });
            }
          });

          await Promise.all(userChecks);
        } catch (e) {
          console.error(`❌ Failed to fetch users for workspace "${workspace.name}"`, e);
        }
      }

      allMembers.value = Array.from(userMap.values());
      localStorage.setItem(
        cacheKey,
        JSON.stringify({ data: allMembers.value, timestamp: Date.now() })
      );

      console.log("✅ Members loaded from API and saved to localStorage");
      loading.value = false;
    });

</script>
