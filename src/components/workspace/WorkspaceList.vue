<template>
  <section>
    <v-row>
      <v-col cols="12">
        <v-card variant="flat">
          <v-card-title>
            Workspaces / Clients
          </v-card-title>
          <v-table v-if="workspaces && workspaces.length > 0">
          <thead>
            <tr>
              <th class="text-left">Name</th>
              <th class="text-left">Employees</th>
              <th class="text-left">Actions</th> <!-- Add an Actions column -->
            </tr>
          </thead>
          <tbody>
            <tr v-for="workspace in workspaces" :key="workspace.id">
              <td>{{ workspace.name }}</td>
              <td>{{ workspace.memberships.length }}</td>
              <td>
                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" icon="mdi-dots-vertical" density="compact" variant="text"></v-btn>
                  </template>
                  <v-list>
                    <v-list-item @click="openDialogHandler(workspace)">
                      <v-list-item-title>View</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </td>
            </tr>
          </tbody>
        </v-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Workspace Users Dialog -->
    <WorkspaceUsersDialog
    v-if="openDialog"
    :open-dialog="openDialog"
    :workspace="selectedWorkspace"
    @close="openDialog = false" />

  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useWorkspaces } from '@/hooks/workspace/useGetAllWorkspace'; // Adjust the import path as necessary
import WorkspaceUsersDialog from "./WorkspaceUsersDialog.vue"

// Fetch the workspaces, loading, error, and fetchWorkspaces from the custom hook
const { workspaces, error, fetchWorkspaces } = useWorkspaces();

const openDialog = ref(false);
const selectedWorkspace = ref<{ id: string; name: string; memberships: Array<{ id: string; name: string; userId: string; hourlyRate: any }> } | null>(null);

onMounted(() => {
  fetchWorkspaces();
});

const openDialogHandler = (workspace:any) => {
  selectedWorkspace.value = workspace;
  openDialog.value = true;
};
</script>

<style scoped>
/* Add custom styling if needed */
</style>
