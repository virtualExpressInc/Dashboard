import { ref } from 'vue';
import api from '@/axiosInstance';

export const useGetUserProfile = () => {
  const profile = ref<any | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchProfile = async (workspaceId: string, userId: string) => {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.get(`/workspaces/${workspaceId}/member-profile/${userId}`);
      profile.value = data;
    } catch (err: any) {
      error.value = err.message || 'Failed to load profile';
    } finally {
      loading.value = false;
    }
  };

  return { profile, loading, error, fetchProfile };
};