import { ref, computed } from 'vue';
import { getAllWorkspaces } from '@/services/workspace.services'; // Adjust this import to your actual service file path
import type { Workspace } from '@/types/workspace.type';

export const useWorkspaces = () => {
  const workspaces = ref<Workspace[] | null>(null); // Store the list of workspaces
  const loading = ref<boolean>(false); // Loading state
  const error = ref<string | null>(null); // Error state

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

  // Compute total users by summing up all memberships
  const totalUsers = computed(() => {
    if (!workspaces.value) return 0;
    return workspaces.value.reduce((sum, workspace) => sum + (workspace.memberships?.length || 0), 0);
  });

  // Compute total workspaces
  const totalWorkspaces = computed(() => workspaces.value?.length || 0);

  // Compute total hourly billable by summing up all hourly rates
  const totalHourlyBillable = computed(() => {
    if (!workspaces.value) return 0;
    return workspaces.value.reduce((total, workspace) => {
      return (
        total +
        (workspace.memberships?.reduce((sum, member) => {
          // Ensure `hourlyRate` is a number or extract its `amount` if it's an object
          const rate = typeof member.hourlyRate === 'number' ? member.hourlyRate : member.hourlyRate?.amount || 0;
          return sum + rate;
        }, 0) || 0)
      );
    }, 0);
  });

  

  return { workspaces, loading, error, fetchWorkspaces, totalUsers, totalWorkspaces, totalHourlyBillable };

  
};
