import { ref } from 'vue';
import type { Workspace } from '@/types/workspace.type';
import { getUserData } from '@/services/user.services';
import type { UserReportDataRequest } from '@/types/userReportData.type';

export const useGetUserData = (workspaceId: string, payload: UserReportDataRequest) => {
  const users = ref<any[] | null>(null);  // Store the list of workspaces
  const loading = ref<boolean>(false);             // Loading state
  const error = ref<string | null>(null);           // Error state

  const fetchUserData = async () => {
    loading.value = true;
    error.value = null;
    try {
      const data = await getUserData(workspaceId, payload);
      users.value = data;
    } catch (err: any) {
      error.value = err.message || 'An error occurred while fetching workspaces.';
    } finally {
      loading.value = false;
    }
  };

  return { users, loading, error, fetchUserData };
};
