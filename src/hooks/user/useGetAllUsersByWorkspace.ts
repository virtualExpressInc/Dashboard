import { ref } from 'vue';
import type { Workspace } from '@/types/workspace.type';
import { getAllUsersByWorkspace } from '@/services/user.services';

export const useUsersByWorkspace = (workspaceId: string) => {
  const users = ref<any[] | null>(null);  // Store the list of workspaces
  const loading = ref<boolean>(false);             // Loading state
  const error = ref<string | null>(null);           // Error state

  const fetchUsersByWorkspace = async () => {
    loading.value = true;
    error.value = null;
    try {
      const data = await getAllUsersByWorkspace(workspaceId);
      users.value = data;
    } catch (err: any) {
      error.value = err.message || 'An error occurred while fetching workspaces.';
    } finally {
      loading.value = false;
    }
  };

  return { users, loading, error, fetchUsersByWorkspace };
};
