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
          {{ hourlyTime(totalWorkedThisWeek) }} hours
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



// Watch for dialog open
watch(() => props.modelValue, async (open) => {
  if (open) {
    await fetchTotalWorkedTime();
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
</style>
