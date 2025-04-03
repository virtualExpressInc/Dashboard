<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<template>
  <v-card>
    <v-card-title class="text-center">
      Average Salary Per Workspace (Up to Current Month)
    </v-card-title>
    <v-card-text style="min-height: 400px; position: relative;">
      <v-progress-circular
        v-if="loading"
        indeterminate
        color="primary"
        size="64"
        style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"
      />
      <apexchart
        v-else
        type="bar"
        :options="chartOptions"
        :series="series"
        height="350"
      />
    </v-card-text>
  </v-card>
</template>
  
  <script lang="ts">
  import { defineComponent, ref, onMounted } from "vue";
  import VueApexCharts from "vue3-apexcharts";
  import { useWorkspaces } from "@/hooks/workspace/useGetAllWorkspace";
  import { useUsersByWorkspace } from "@/hooks/user/useGetAllUsersByWorkspace";
  import { useGetUserData } from "@/hooks/user/useGetUserData";
  import { moneyFormat } from "@/helpers/moneyFormat";
  import { hourlyTime } from "@/helpers/hourlyTime";
  
  interface UserTimeData {
    user: {
      id: string;
    };
    totalTime?: string;
  }
  
  export default defineComponent({
    name: "AverageSalaryChart",
    components: {
      apexchart: VueApexCharts,
    },
    setup() {
      const { workspaces, fetchWorkspaces } = useWorkspaces();
      const loading = ref(true);
  
      const chartOptions = ref({
        chart: {
          id: "average-salary-bar",
          type: 'bar',
          height: 350,
          toolbar: { show: false }
        },
        plotOptions: {
          bar: {
            horizontal: true,
            endingShape: 'rounded',
            borderRadius: 4
          },
        },
        dataLabels: {
          enabled: true,
          formatter: (val: number) => `₱${moneyFormat(val)}`,
          offsetX: 10,
          style: {
            fontSize: '12px',
            colors: ["#FFFFFF"]
          }
        },
        tooltip: { // Add this tooltip configuration
          y: {
            formatter: function(val: number) {
              return `₱${moneyFormat(val)}`;
            }
          }
        },
        xaxis: {
          categories: [] as string[],
          labels: {
            formatter: (val: number) => `₱${moneyFormat(val)}`,
          }
        },
        yaxis: {
          labels: {
            formatter: (val: string) => val,
          },
        },
        colors: ['#008FFB'],
        fill: {
          opacity: 1
        },
        noData: {
          text: "Loading data...",
          align: 'center',
          verticalAlign: 'middle'
        }
      });
  
      const series = ref<any[]>([]); // Updated type to allow dynamic array of series
  
      // Get the full date range for the entire year (January to the current month)
      const getYearDateRange = (month: number): { start: string; end: string } => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), month, 1); // First day of the month
        const endOfMonth = new Date(now.getFullYear(), month + 1, 0); // Last day of the month
        return {
          start: startOfMonth.toISOString(),
          end: endOfMonth.toISOString()
        };
      };
  
      const calculateAverageUpToCurrentMonth = async (workspace: any): Promise<number> => {
        try {
          const monthsToCalculate = new Date().getMonth(); // This gets the current month (0-11)
          let totalSalary = 0;
          let userCountWithTime = 0;
  
          // Fetch users for this workspace
          const { users, fetchUsersByWorkspace } = useUsersByWorkspace(workspace.id);
          await fetchUsersByWorkspace();
  
          if (!users.value || users.value.length === 0) {
            console.warn(`No users found for workspace ${workspace.name}`);
            return 0;
          }
  
          // Iterate over each month up to the current month (from January to the current month)
          for (let month = 0; month <= monthsToCalculate; month++) {
            const dateRange = getYearDateRange(month);
            const payload = {
              start: dateRange.start,
              end: dateRange.end,
              type: "PROJECT",
              sortOrder: "DESCENDING",
              sortColumn: "DATE",
              page: 1,
              pageSize: 100
            };
  
            const { users: timeEntries, fetchUserData } = useGetUserData(workspace.id, payload);
            await fetchUserData(payload);
  
            // Calculate total salary for the current month
            users.value.forEach(user => {
              const userEntries = (timeEntries.value as UserTimeData[] | undefined)?.find(entry => entry.user.id === user.id);
              const duration = userEntries?.totalTime || "PT0S";
  
              if (duration !== "PT0S") {
                const hours = hourlyTime(duration);
                const membership = workspace.memberships?.find((m: any) => m.userId === user.id);
                const rate = membership?.hourlyRate?.amount || 0;
  
                if (rate > 0) {
                  totalSalary += hours * rate;
                  userCountWithTime++;
                }
              }
            });
          }
  
          // Calculate the average salary for the period from January to the current month
          return userCountWithTime > 0 ? totalSalary / userCountWithTime : 0;
        } catch (error) {
          console.error(`Error calculating average salary for workspace ${workspace.name}:`, error);
          return 0;
        }
      };
  
      const updateChartData = async () => {
        try {
          loading.value = true;
          console.log("Fetching all workspaces...");
          await fetchWorkspaces();
  
          if (!workspaces.value || workspaces.value.length === 0) {
            console.warn("No workspaces available");
            return;
          }
  
          const categories: string[] = []; // Workspace names
          const allSeriesData: number[] = []; // Average salary values
  
          for (const workspace of workspaces.value) {
            console.log(`Calculating average salary up to current month for workspace: ${workspace.name}`);
            const averageSalary = await calculateAverageUpToCurrentMonth(workspace);
  
            // Skip workspaces with 0 salary
            if (averageSalary === 0) continue;
  
            // Add the workspace name to categories
            categories.push(workspace.name);
            // Add the average salary value to the data array
            allSeriesData.push(averageSalary);
          }
  
          // Now properly set the xaxis categories and series data
          chartOptions.value = {
            ...chartOptions.value,
            xaxis: {
              categories: categories, // Workspace names as categories
              labels: {
                formatter: (val: number) => `₱${moneyFormat(Number(val))}`, // Format to display peso on x-axis
              }
            }
          };
  
          series.value = [{
            name: "Average Salary",
            data: allSeriesData, // Pass the average salaries as data
          }];
        } catch (error) {
          console.error("Error updating chart data:", error);
        } finally {
          loading.value = false;
        }
      };
  
      onMounted(() => {
        updateChartData();
      });
  
      return {
        chartOptions,
        series,
        loading
      };
    },
  });
  </script>
  
  <style scoped>
  .v-card {
    margin: 20px;
  }
  </style>
  