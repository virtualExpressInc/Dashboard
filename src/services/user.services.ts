import api from "@/axiosInstance";
import globalApi from "@/axiosInstance/globalApi";
import type { UserReportDataRequest } from "@/types/userReportData.type";

export const getAllUsersByWorkspace = async (workspaceId:string) => {
  const { data } = await api.get(`/workspaces/${workspaceId}/users`);
  return data;
};

export const getUserData = async (workspaceId:string, payload: UserReportDataRequest) => {
  const { data } = await globalApi.get(`/workspaces/${workspaceId}/reports/team-activities/`, {
    params: payload,
  });
  return data;
};
