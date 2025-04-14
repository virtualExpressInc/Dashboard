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
          type: "bar",
          height: 350,
          toolbar: { show: false }
        },
        plotOptions: {
          bar: {
            horizontal: true,
            endingShape: "rounded",
            borderRadius: 4
          },
        },
        dataLabels: {
          enabled: true,
          formatter: (val: number) => `₱${moneyFormat(val)}`,
          offsetX: 10,
          style: {
            fontSize: "12px",
            colors: ["#FFFFFF"]
          }
        },
        tooltip: {
          y: {
            formatter: function (val: number) {
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
          }
        },
        colors: ["#008FFB"],
        fill: {
          opacity: 1
        },
        noData: {
          text: "Loading data...",
          align: "center",
          verticalAlign: "middle"
        }
      });

      const series = ref<any[]>([]);

      const getYearDateRange = (month: number): { start: string; end: string } => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), month, 1);
        const endOfMonth = new Date(now.getFullYear(), month + 1, 0);
        return {
          start: startOfMonth.toISOString(),
          end: endOfMonth.toISOString()
        };
      };

      const calculateAverageUpToCurrentMonth = async (workspace: any): Promise<number> => {
        try {
          const monthsToCalculate = new Date().getMonth();
          let totalSalary = 0;
          let userCountWithTime = 0;

          const { users, fetchUsersByWorkspace } = useUsersByWorkspace(workspace.id);
          await fetchUsersByWorkspace();

          if (!users.value || users.value.length === 0) {
            console.warn(`No users found for workspace ${workspace.name}`);
            return 0;
          }

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

          return userCountWithTime > 0 ? totalSalary / userCountWithTime : 0;
        } catch (error) {
          console.error(`Error calculating average salary for workspace ${workspace.name}:`, error);
          return 0;
        }
      };

      const updateChartData = async () => {
        try {
          loading.value = true;
          await fetchWorkspaces();

          if (!workspaces.value || workspaces.value.length === 0) {
            console.warn("No workspaces available");
            return;
          }

          const categories: string[] = [];
          const allSeriesData: number[] = [];

          for (const workspace of workspaces.value) {
            const averageSalary = await calculateAverageUpToCurrentMonth(workspace);
            if (averageSalary === 0) continue;
            categories.push(workspace.name);
            allSeriesData.push(averageSalary);
          }

          chartOptions.value.xaxis.categories = categories;
          series.value = [{ name: "Average Salary", data: allSeriesData }];

          // Save to cache
          localStorage.setItem("avgSalaryData", JSON.stringify({
            data: series.value,
            categories,
            cachedAt: new Date().toISOString()
          }));
          console.log("[AverageSalaryChart] Cached chart data.");
        } catch (error) {
          console.error("Error updating chart data:", error);
        } finally {
          loading.value = false;
        }
      };

      onMounted(() => {
        const cache = localStorage.getItem("avgSalaryData");
        if (cache) {
          try {
            const parsed = JSON.parse(cache);
            const cachedTime = new Date(parsed.cachedAt).getTime();
            const now = Date.now();
            const maxAge = 1000 * 60 * 60 * 24; // 24 hrs

            if (now - cachedTime < maxAge) {
              console.log("[AverageSalaryChart] Loaded from cache.");
              chartOptions.value.xaxis.categories = parsed.categories;
              series.value = parsed.data;
              loading.value = false;
              return;
            } else {
              console.log("[AverageSalaryChart] Cache expired, refreshing...");
            }
          } catch (e) {
            console.warn("[AverageSalaryChart] Failed to parse cache.");
          }
        }

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
  