<template>
  <section style="height: 100%;">
    <v-card style="height: 100%;">
      <v-card-text class="text-center">
        <v-progress-circular
          v-if="loading"
          indeterminate
          color="primary"
          size="64"
          style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"
        ></v-progress-circular>
        <apexchart
          v-else
          type="bar"
          :options="chartOptions"
          :series="chartSeries"
          style="width: 100%; height: 100%;"
        />
      </v-card-text>
    </v-card>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import VueApexCharts from "vue3-apexcharts";
import { useWorkspaces } from "@/hooks/workspace/useGetAllWorkspace";
import { useUsersByWorkspace } from "@/hooks/user/useGetAllUsersByWorkspace";
import { useGetUserData } from "@/hooks/user/useGetUserData";
import { hourlyTime } from "@/helpers/hourlyTime";

interface MonthDateRange {
  start: string;
  end: string;
}

interface ChartSeriesItem {
  name: string;
  data: number[];
}

export default defineComponent({
  name: "MonthlyBillablesChart",
  components: {
    apexchart: VueApexCharts,
  },
  setup() {
    const { workspaces, fetchWorkspaces } = useWorkspaces();
    const chartSeries = ref<ChartSeriesItem[]>([{ name: "Billables", data: [] }]);
    const loading = ref(true);
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                       "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const activeMonths = monthNames.slice(0, currentMonth + 1);
    
    const chartOptions = ref({
      chart: { 
        id: "bar-chart",
        toolbar: { show: false },
        height: '100%'
      },
      xaxis: { 
        categories: activeMonths,
        title: {
          text: `Months (Jan - ${monthNames[currentMonth]})`
        }
      },
      yaxis: {
        title: {
          text: "Amount (₱)",
          formatter: function(value: number) {
            return "₱" + value;
          }
        },
        labels: {
          formatter: function(value: number) {
            return "₱" + (value / 1000) + "k";
          }
        }
      },
      title: { 
        text: `Monthly Billables (${currentYear})`, 
        align: "center" 
      },
      plotOptions: {
        bar: {
          columnWidth: '45%',
          distributed: true,
          borderRadius: 4
        }
      },
      dataLabels: {
        enabled: true,
        formatter: function(val: number) {
          return "₱" + (val).toLocaleString();
        },
        offsetY: -20,
        style: {
          fontSize: '12px',
          colors: ["#FFFFFF"]
        }
      },
      colors: ['#008FFB'],
      fill: {
        opacity: 1
      },
      tooltip: {
        y: {
          formatter: function(value: number) {
            return "₱" + (value).toLocaleString();
          }
        }
      }
    });

    const getMonthDateRange = (year: number, month: number): MonthDateRange => {
      const start = new Date(year, month, 1);
      const end = month === currentMonth 
        ? currentDate
        : new Date(year, month + 1, 0);
      
      return {
        start: start.toISOString().split('T')[0] + "T00:00:00.000Z",
        end: end.toISOString().split('T')[0] + "T23:59:59.999Z"
      };
    };

    const computeMonthlyBillables = async (): Promise<void> => {
      const monthlyTotals: number[] = new Array(currentMonth + 1).fill(0);

      try {
        loading.value = true;
        await fetchWorkspaces();

        if (!workspaces.value || workspaces.value.length === 0) {
          console.warn("[BarGraph] No workspaces found");
          chartSeries.value[0].data = monthlyTotals;
          return;
        }

        for (const workspace of workspaces.value) {
          const { users, fetchUsersByWorkspace } = useUsersByWorkspace(workspace.id);
          await fetchUsersByWorkspace();

          if (!users.value || users.value.length === 0) continue;

          for (let month = 0; month <= currentMonth; month++) {
            const dateRange = getMonthDateRange(currentYear, month);
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
              const userEntries = timeEntries.value?.find(entry => entry.user.id === user.id);
              const duration = userEntries?.totalTime || "PT0S";
              const hours = hourlyTime(duration);
              const rate = workspace.memberships?.find(m => m.userId === user.id)?.hourlyRate?.amount || 0;
              
              monthlyTotals[month] += hours * rate;
            });
          }
        }

        chartSeries.value[0].data = monthlyTotals.map(amount => Math.round(amount) / 100);
      } catch (error) {
        console.error("[BarGraph] Error in computeMonthlyBillables:", error);
        chartSeries.value[0].data = new Array(currentMonth + 1).fill(0);
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      computeMonthlyBillables();
    });

    return { chartOptions, chartSeries, loading };
  },
});
</script>

<style scoped>
.v-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.v-card-text {
  position: relative;
  flex: 1;
  min-height: 400px;
}
</style>