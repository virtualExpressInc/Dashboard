import api from "@/axiosInstance";

export const getAllWorkspaces = async () => {
  const { data } = await api.get(`/workspaces`);
  return data;
};
