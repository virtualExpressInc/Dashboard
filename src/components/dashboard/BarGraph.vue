<template>
  <section>
    <v-card>
      <v-card-text>
        <apexchart
          type="bar"
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
import { ref, onMounted, computed } from "vue";
import { hourlyTime } from "@/helpers/hourlyTime";
import { moneyFormat } from "@/helpers/moneyFormat";

export default {
  components: {
    apexchart: VueApexCharts,
  },
  setup() {
    console.log("[BarGraph] Initializing component"); // Log 1: Component initialization
    
    const { workspaces, fetchWorkspaces } = useWorkspaces();
    const chartSeries = ref([{ name: "Billables", data: [] }]);
    
    // Get current month (0-11)
    const currentMonth = new Date().getMonth();
    
    // Generate month labels from Jan to current month
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const activeMonths = monthNames.slice(0, currentMonth + 1);
    
    
    const chartOptions = ref({
      chart: { id: "bar-chart" },
      xaxis: { 
        categories: activeMonths,
        title: {
          text: `Months (Jan - ${monthNames[currentMonth]})`
        }
      },
      title: { 
        text: `Monthly Billables (${new Date().getFullYear()})`, 
        align: "center" 
      },
      plotOptions: {
        bar: {
          columnWidth: '70%' // Adjust bar width
        }
      }
    });

    const getMonthDateRange = (year, month) => {
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0);
      return {
        start: start.toISOString().split('T')[0] + "T00:00:00.000Z",
        end: end.toISOString().split('T')[0] + "T23:59:59.999Z"
      };
    };

    const computeMonthlyBillables = async () => {
 
      
      const currentYear = new Date().getFullYear();
      const monthlyTotals = [0, 0, 0, 0, 0, 0, 0];

      try {

        await fetchWorkspaces();


        if (!workspaces.value) {
          console.warn("[BarGraph] No workspaces found"); // Log 5: Empty workspaces
          return;
        }

        for (const [wIndex, workspace] of workspaces.value.entries()) {


          const { users, fetchUsersByWorkspace } = useUsersByWorkspace(workspace.id);
          await fetchUsersByWorkspace();


          if (!users.value) continue;

          for (let month = 0; month < 7; month++) {
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


        chartSeries.value[0].data = monthlyTotals.map(amount => moneyFormat(amount));
      } catch (error) {
        console.error("[BarGraph] Error in computeMonthlyBillables:", error); // Log 14: Error case
      }
    };

    onMounted(() => {
      console.log("[BarGraph] Component mounted"); // Log 15: Mounted hook
      computeMonthlyBillables();
    });

    return { chartOptions, chartSeries };
  },
};
</script>