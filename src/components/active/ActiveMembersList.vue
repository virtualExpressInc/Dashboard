<template>
    <v-card>
      <!-- Card Title + Filter -->
      <v-card-title class="d-flex justify-between align-center">
        <v-spacer />
        <v-select
          v-model="selectedWorkspace"
          :items="workspaceOptions"
          label="Filter by Workspace"
          item-title="name"
          item-value="id"
          clearable
          dense
          outlined
          style="max-width: 300px"
        />
      </v-card-title>
  
      <!-- Section Header -->
      <v-card-text class="px-6 pt-2">
        <h4 class="text-h6 font-weight-medium mb-2">Member List</h4>
      </v-card-text>
  
      <!-- Table -->
      <v-card-text>
        <!-- Static header row -->
        <div class="d-flex px-6 py-2 font-weight-medium text-subtitle-2" style="background-color: #f5f5f5;">
            <div style="width: 40%; min-width: 240px;">Name</div>
            <div style="width: 40%;">Workspace</div>
            <div style="width: 20%;">Status</div>
        </div>


        <!-- Data table -->
        <v-data-table
            :headers="headers"
            :items="filteredMembers"
            :loading="loading"
            class="elevation-1"
            hide-default-header
            item-value="email"
            >
                <template v-slot:item="{ item }">
                    <div class="d-flex px-6 py-4 align-center" style="border-bottom: 1px solid #eee;">
                    <!-- Name (Avatar + Email) -->
                    <div style="width: 40%; min-width: 240px;" class="d-flex align-center">
                        <v-avatar size="40" class="border" style="border: 2px solid #000;">
                        <v-img v-if="item.profilePicture" :src="item.profilePicture" alt="User Avatar" />
                        <span v-else class="avatar-placeholder">{{ item.name.charAt(0).toUpperCase() }}</span>
                        </v-avatar>
                        <div class="d-flex flex-column align-left ml-2">
                        <div>{{ item.name }}</div>
                        <div class="text-caption">{{ item.email }}</div>
                        </div>
                    </div>

                    <!-- Workspace -->
                    <div style="width: 40%;">
                        {{ item.workspace }}
                    </div>

                    <!-- Status -->
                    <div style="width: 20%;">
                        <v-chip :color="item.status === 'ACTIVE' ? 'green' : 'grey'" dark>
                        {{ item.status === 'ACTIVE' ? 'Tracking' : 'Idle' }}
                        </v-chip>
                    </div>
                    </div>
                </template>
            </v-data-table>
        </v-card-text>
  
      <!-- No Data Alert -->
      <v-alert v-if="!loading && filteredMembers.length === 0" type="info" class="mt-4">
        No members found.
      </v-alert>
    </v-card>
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
  