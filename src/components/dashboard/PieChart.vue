<template>
  <section>
    <v-card>
      <v-card-text>
        <apexchart
          type="pie"
          :options="chartOptions"
          :series="chartSeries"
          height="350"
        />
      </v-card-text>
    </v-card>
  </section>
</template>

<script>
import VueApexCharts from "vue3-apexcharts";
import { useWorkspaces } from "@/hooks/workspace/useGetAllWorkspace";
import { useUsersByWorkspace } from "@/hooks/user/useGetAllUsersByWorkspace";
import { useGetUserData } from "@/hooks/user/useGetUserData";
import { ref, onMounted } from "vue";
import { hourlyTime } from "@/helpers/hourlyTime";

export default {
  components: {
    apexchart: VueApexCharts,
  },
  setup() {
    const { workspaces, fetchWorkspaces } = useWorkspaces();
    const chartSeries = ref([]);
    const chartOptions = ref({
      chart: {
        id: "pie-chart",
      },
      labels: [], // Will be populated with workspace names
      title: {
        text: "2025 Workspace Billables",
        align: "center",
      },
      legend: {
        position: "top",
      },
      tooltip: {
        y: {
          formatter: function(val) {
            return `₱${val.toLocaleString()}`; // Format tooltip as pesos
          }
        }
      }
    });

    const getCurrentYearDateRange = () => {
      const currentYear = new Date().getFullYear();
      const start = new Date(currentYear, 0, 1); // January 1st of current year
      const end = new Date(); // Today
      return {
        start: start.toISOString().split('T')[0] + "T00:00:00.000Z",
        end: end.toISOString().split('T')[0] + "T23:59:59.999Z"
      };
    };

    const calculateWorkspaceBillables = async () => {
      await fetchWorkspaces();
      if (!workspaces.value) return;

      const { start, end } = getCurrentYearDateRange();
      // console.log(`Fetching data for period: ${start} to ${end}`);

      const workspaceTotals = [];
      const workspaceNames = [];

      for (const workspace of workspaces.value) {
        const { users, fetchUsersByWorkspace } = useUsersByWorkspace(workspace.id);
        await fetchUsersByWorkspace();
        if (!users.value) continue;

        let workspaceTotal = 0;
        const { users: timeEntries, fetchUserData } = useGetUserData(workspace.id, {
          start,
          end,
          type: "PROJECT",
          pageSize: 100
        });
        await fetchUserData();

        users.value.forEach(user => {
          const userEntries = timeEntries.value?.find(entry => entry.user.id === user.id);
          const duration = userEntries?.totalTime || "PT0S";
          const hours = hourlyTime(duration);
          const rate = workspace.memberships?.find(m => m.userId === user.id)?.hourlyRate?.amount || 0;
          workspaceTotal += hours * rate;
        });

        workspaceTotals.push(Math.round(workspaceTotal));
        workspaceNames.push(workspace.name);
        // console.log(`Workspace ${workspace.name}: ₱${workspaceTotal.toLocaleString()}`);
      }

      chartSeries.value = workspaceTotals;
      chartOptions.value.labels = workspaceNames;
    };

    onMounted(calculateWorkspaceBillables);

    return { chartOptions, chartSeries };
  },
};
</script>

<style scoped>
/* Add custom styles here if needed */
</style>