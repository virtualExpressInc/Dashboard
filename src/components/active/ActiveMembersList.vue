<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card
          class="rounded-lg"
          variant="flat"
          style="border: 1px solid #eee;"
        >
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
            item-value="email"
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
                    v-if="item.status === 'ACTIVE'"
                    color="green"
                    size="small"
                    class="mr-1"
                  >mdi-checkbox-blank-circle</v-icon>
                  <v-icon
                    v-else
                    color="grey"
                    size="small"
                    class="mr-1"
                  >mdi-checkbox-blank-circle</v-icon>
                  <span>{{ item.status === 'ACTIVE' ? 'Tracking' : 'Idle' }}</span>
                </div>
              </div>
            </template>
          </v-data-table>

          <!-- No Data Message -->
          <v-alert v-if="!loading && filteredMembers.length === 0" type="info" class="mt-4 mx-6 mb-6">
            No members found.
          </v-alert>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>



  
  <script setup lang="ts">
  import { onMounted, ref, computed } from 'vue';
  import axios from 'axios';
  import { useWorkspaces } from '@/hooks/workspace/useGetAllWorkspace';
  import { getAllUsersByWorkspace } from '@/services/user.services';
  
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

  
  const API_KEY = 'your-clockify-api-key'; // 🔐 Replace with env variable
  const baseClockifyURL = 'https://api.clockify.me/api/v1/';
  
  const isUserTimerRunning = async (workspaceId: string, userId: string): Promise<boolean> => {
    try {
      const { data } = await axios.get(
        `${baseClockifyURL}workspaces/${workspaceId}/user/${userId}/time-entries?in-progress=true`,
        {
          headers: {
            'X-Api-Key': API_KEY
          }
        }
      );
      return data.length > 0 && data[0].timeInterval?.end === null;
    } catch (error) {
      console.error(`⛔ Error checking timer for user ${userId}:`, error);
      return false;
    }
  };
  
  onMounted(async () => {
    await fetchWorkspaces();
  
    if (!workspaces.value) {
      loading.value = false;
      return;
    }
  
    const usersAcrossWorkspaces: any[] = [];
  
    for (const workspace of workspaces.value) {
      try {
        const users = await getAllUsersByWorkspace(workspace.id);
  
        for (const user of users) {
          const isRunning = await isUserTimerRunning(workspace.id, user.id);
  
          usersAcrossWorkspaces.push({
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture || null,
            workspace: workspace.name,
            workspaceId: workspace.id,
            status: isRunning ? 'ACTIVE' : 'INACTIVE'
          });
        }
      } catch (e) {
        console.error(`Failed to fetch users for workspace ${workspace.name}`, e);
      }
    }
  
    allMembers.value = usersAcrossWorkspaces;
    loading.value = false;
  });
  </script>
  