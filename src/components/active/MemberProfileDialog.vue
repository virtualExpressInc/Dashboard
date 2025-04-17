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
                <span
                    class="status-indicator"
                    :class="profile?.status === 'ACTIVE' ? 'bg-green' : 'bg-grey'"
                ></span>
            </div>
        </v-row>
  
        <!-- Name -->
        <h2 class="text-h6 text-center font-weight-bold mb-2">{{ profile?.name }}</h2>
        
        <div class="mb-4 d-flex align-center">
            <span class="font-weight-bold mr-2">Status:</span>
            <v-icon
                :color="profile?.status === 'ACTIVE' ? 'green' : 'grey'"
                size="small"
                class="mr-1"
            >
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
  
          <!-- Creative Work Days -->
          <p class="font-weight-bold mb-2">Working Days:</p>
          <div class="d-flex flex-wrap gap-2">
            <v-chip
              v-for="day in allDays"
              :key="day"
              :color="profile?.workingDays?.includes(day) ? 'primary' : 'grey lighten-1'"
              :variant="profile?.workingDays?.includes(day) ? 'flat' : 'outlined'"
              size="small"
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
  import { hourlyTime } from '@/helpers/hourlyTime'
  
  defineProps<{
        modelValue: boolean
        profile: {
            name: string
            email: string
            imageUrl: string
            workCapacity: string
            workingDays: string[]
            workspaceNumber: number
            status?: string
        } | null
        status?: string
    }>()
  
  defineEmits(['update:modelValue'])
  
  const allDays = [
    'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY',
    'FRIDAY', 'SATURDAY', 'SUNDAY'
  ]
  </script>
  

  <style scoped>
    .avatar-placeholder {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: #90a4ae;
    color: white;
    font-weight: bold;
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

</style>
