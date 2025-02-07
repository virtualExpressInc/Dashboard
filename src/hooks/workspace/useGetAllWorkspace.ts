import { ref } from 'vue';
import { getAllWorkspaces } from '@/services/workspace.services'; // Adjust this import to your actual service file path
import type { Workspace } from '@/types/workspace.type';

export const useWorkspaces = () => {
  const workspaces = ref<Workspace[] | null>(null);  // Store the list of workspaces
  const loading = ref<boolean>(false);             // Loading state
  const error = ref<string | null>(null);           // Error state

  const fetchWorkspaces = async () => {
    loading.value = true;
    error.value = null;
    try {
      const data = await getAllWorkspaces();
      workspaces.value = data;
    } catch (err: any) {
      error.value = err.message || 'An error occurred while fetching workspaces.';
    } finally {
      loading.value = false;
    }
  };

  return { workspaces, loading, error, fetchWorkspaces };
};
