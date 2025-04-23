<template>
  <v-dialog :model-value="modelValue" max-width="600px" @update:modelValue="$emit('update:modelValue', $event)">
    <v-card class="pa-6">
      <!-- Avatar -->
      <v-row justify="center" class="mb-4">
        <div class="status-avatar-wrapper mx-auto mb-4">
          <v-avatar size="80">
            <v-img v-if="profile?.imageUrl" :src="profile.imageUrl" alt="User Avatar" />
            <span v-else class="avatar-placeholder">{{ profile?.name.charAt(0).toUpperCase() }}</span>
          </v-avatar>
          <span class="status-indicator" :class="profile?.status === 'ACTIVE' ? 'bg-green' : 'bg-grey'"></span>
        </div>
      </v-row>

      <!-- Name -->
      <h2 class="text-h6 text-center font-weight-bold mb-2">{{ profile?.name }}</h2>

      <div class="mb-4 d-flex align-center">
        <span class="font-weight-bold mr-2">Status:</span>
        <v-icon :color="profile?.status === 'ACTIVE' ? 'green' : 'grey'" size="small" class="mr-1">
          mdi-checkbox-blank-circle
        </v-icon>
        <span>{{ profile?.status === 'ACTIVE' ? 'Tracking' : 'Idle' }}</span>
      </div>

      <!-- Section: Personal Info -->
      <div class="mt-4">
        <p><span class="font-weight-bold">Email:</span> {{ profile?.email }}</p>
      </div>

      <!-- Section: Work Info -->
      <div class="mt-4">
        <h3 class="text-h5 font-weight-bold mb-2">Work Details</h3>
        <p>
          <span class="font-weight-bold">Work Capacity:</span>
          {{ hourlyTime(profile?.workCapacity || 'PT0H') }} hours
        </p>

        <p>
          <span class="font-weight-bold">Total Hours Worked This Week:</span>
          {{ (hourlyTime(totalWorkedThisWeek) as number).toFixed(2) }} hours
        </p>

        <!-- Creative Work Days -->
        <p class="font-weight-bold mb-2">Working Days:</p>
        <div class="d-flex flex-wrap gap-2">
          <v-chip
            v-for="day in allDays"
            :key="day"
            :color="profile?.workingDays?.includes(day) ? 'primary' : 'grey lighten-1'"
            :variant="profile?.workingDays?.includes(day) ? 'flat' : 'outlined'"
            size="small"
            class="day-chip"
          >
            {{ day.slice(0, 3) }}
          </v-chip>
        </div>

        <p class="mt-4">
          <span class="font-weight-bold">Workspace Number:</span> {{ profile?.workspaceNumber }}
        </p>
      </div>

      <!-- Calendar -->
      <div class="weekly-calendar mt-6">
      <h3 class="text-h5 font-weight-bold mb-4">Weekly Work Calendar</h3>
      <div class="calendar-container">
        <!-- Times on the left -->
        <div class="time-column">
          <div v-for="hour in hoursList" :key="hour" class="time-label">
            {{ hour }}
          </div>
        </div>

        <!-- Days Grid -->
        <div class="days-grid">
          <div v-for="day in allDays" :key="day" class="day-column">
            <div class="day-header">{{ day.slice(0, 3) }}</div>
            <div class="day-body">
              <!-- Bars for each time entry -->
              <div
                v-for="entry in timeEntriesPerDay[day]"
                :key="entry.id"
                class="time-block"
                :style="{
                  top: entry.startPercent + '%',
                  height: entry.durationPercent + '%'
                }"
              >
                {{ entry.durationText }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      <!-- Close Button -->
      <v-card-actions class="justify-end mt-6">
        <v-btn color="primary" @click="$emit('update:modelValue', false)">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { hourlyTime } from '@/helpers/hourlyTime';
import Api from '../../axiosInstance/globalApi';
import api from '@/axiosInstance';


const props = defineProps<{
  modelValue: boolean
  profile: {
    name: string
    email: string
    imageUrl: string
    workCapacity: string
    workingDays: string[]
    workspaceNumber: number
    totalWorkedThisWeek: string
    status?: string
  } | null
  workspaceId: string
  userId: string
}>();

defineEmits(['update:modelValue']);

const totalWorkedThisWeek = ref('PT0H');


const fetchTotalWorkedTime = async () => {
  if (!props.workspaceId || !props.userId) return;

  try {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const { data } = await api.get(`/workspaces/${props.workspaceId}/user/${props.userId}/time-entries`, {
      params: {
        start: weekStart.toISOString(),
        end: weekEnd.toISOString()
      }
    });

    let totalSeconds = 0;
    data.forEach((entry: any) => {
      if (entry.timeInterval?.start && entry.timeInterval?.end) {
        const start = new Date(entry.timeInterval.start);
        const end = new Date(entry.timeInterval.end);
        totalSeconds += (end.getTime() - start.getTime()) / 1000;
      }
    });

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    totalWorkedThisWeek.value = `PT${hours}H${minutes}M`;
  } catch (error) {
    console.error("Failed to fetch total worked time:", error);
  }
};

const hoursList = [
  '12 AM', '1 AM', '2 AM', '3 AM', '4 AM', '5 AM', '6 AM', '7 AM', '8 AM', '9 AM',
  '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM',
  '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM'
];

const timeEntriesPerDay = ref<Record<string, any[]>>({
  MONDAY: [],
  TUESDAY: [],
  WEDNESDAY: [],
  THURSDAY: [],
  FRIDAY: [],
  SATURDAY: [],
  SUNDAY: []
});

const fetchCalendarEntries = async () => {
  if (!props.workspaceId || !props.userId) return;

  try {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const { data } = await api.get(`/workspaces/${props.workspaceId}/user/${props.userId}/time-entries`, {
      params: {
        start: weekStart.toISOString(),
        end: weekEnd.toISOString()
      }
    });

    // Reset
    for (const day of allDays) {
      timeEntriesPerDay.value[day] = [];
    }

    data.forEach((entry: any) => {
      if (entry.timeInterval?.start && entry.timeInterval?.end) {
        let start = new Date(entry.timeInterval.start);
        let end = new Date(entry.timeInterval.end);

        while (start < end) {
          const day = start.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

          const endOfDay = new Date(start);
          endOfDay.setHours(23, 59, 59, 999);

          const segmentEnd = end <= endOfDay ? end : endOfDay;

          const durationMs = segmentEnd.getTime() - start.getTime();
          if (durationMs <= 0) break; // Prevent infinite loop

          const duration = durationMs / 1000 / 60; // in minutes
          const startMinutes = start.getHours() * 60 + start.getMinutes();
          const startPercent = (startMinutes / (24 * 60)) * 100;
          const durationPercent = (duration / (24 * 60)) * 100;

          if (timeEntriesPerDay.value[day]) {
            timeEntriesPerDay.value[day].push({
              id: `${entry.id}-${day}`,
              startPercent,
              durationPercent,
              durationText: `${Math.floor(duration / 60)}h ${Math.floor(duration % 60)}m`
            });
          }

          if (segmentEnd >= end) break;

          // Move to next day 00:00
          start = new Date(segmentEnd.getTime() + 1);
          start.setHours(0, 0, 0, 0);
        }
      }
    });

  } catch (error) {
    console.error("Failed to fetch calendar entries:", error);
  }
};

// Watch for dialog open
watch(() => props.modelValue, async (open) => {
  if (open) {
    await fetchTotalWorkedTime();
    await fetchCalendarEntries();
  }
});

const allDays = [
  'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY',
  'FRIDAY', 'SATURDAY', 'SUNDAY'
];
</script>

<style scoped>
.avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #90a4ae;
  color: white;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.status-avatar-wrapper {
  position: relative;
  width: fit-content;
}

.status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid white;
}

.bg-green {
  background-color: #00be00;
}

.bg-grey {
  background-color: #B0BEC5;
}

.day-chip {
  min-width: 48px;
  text-align: center;
  justify-content: center;
  font-weight: 500;
  padding-left: 10px;
  padding-right: 10px;
  margin-right: 4px;
  margin-bottom: 6px;
}

.calendar-container {
  display: flex;
  border: 1px solid #ccc;
  overflow: hidden;
}

.time-column {
  width: 50px; 
  border-right: 1px solid #ccc;
  display: flex;
  flex-direction: column;
  align-items: flex-end; 
  padding-right: 5px;  
  box-sizing: border-box;
}

.time-label {
  height: 30px; 
  font-size: 10px;
  text-align: right;
  padding-right: 6px;
  color: #555;
}

.days-grid {
  display: flex;
  flex: 1;
}

.day-column {
  flex: 1;
  border-left: 1px solid #ccc;
  position: relative;
}

.day-header {
  height: 30px;
  text-align: center;
  font-weight: bold;
  background-color: #f5f5f5;
  border-bottom: 1px solid #ccc;
}

.day-body {
  position: relative;
  height: 720px; /* 24 hours * 30px */
  border-top: 1px solid #eee;
  padding-left: 2px; /* Optional spacing */
  padding-right: 2px;
}

.time-block {
  position: absolute;
  left: 5%;
  width: 90%;
  background-color: #42a5f5;
  color: white;
  font-size: 10px;
  padding: 2px 4px;
  border-radius: 4px;
  box-sizing: border-box;
}

</style>