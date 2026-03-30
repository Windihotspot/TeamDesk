<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import MainLayout from '@/layouts/full/MainLayout.vue'
import { supabase } from '@/services/supabase.js'
import Apexchart from 'vue3-apexcharts'
import { ElMessageBox, ElButton, ElSelect, ElOption, ElMessage } from 'element-plus'
const showDialog = ref(false)
const formRef = ref(null)
const formValid = ref(false)
const submitting = ref(false)

const isEditMode = ref(false)
const editingAttendanceId = ref(null)

const form = ref({
  userType: '',
  userId: '',
  status: 'Present',
  checkInTime: '',
  remarks: ''
})

const userTypes = ['student', 'teacher', 'employee']
const usersList = ref([])
const loadingUsers = ref(false)

// ✅ Validation Rules
const rules = {
  required: (v) => !!v || 'This field is required',
  userType: (v) => !!v || 'Select a user type',
  userId: (v) => !!v || 'Select a user'
}


const openAddDialog = () => {
  showDialog.value = true
}

const openEditDialog = async (log) => {
  isEditMode.value = true
  editingAttendanceId.value = log.id

  // Set type FIRST
  form.value.userType = log.user_type

  // Load users WITHOUT clearing userId
  await onUserTypeChange(log.user_type, true)

  // Now safely set the user
  form.value.userId = log.user_id
  form.value.status = log.status
  form.value.remarks = log.remarks || ''
  // ✅ FIXED: NO Date(), NO timezone conversion
  form.value.checkInTime = log.check_in_time ? log.check_in_time.slice(11, 16) : ''

  form.value.classId = log.class_id || null

  showDialog.value = true
}

const resetForm = () => {
  isEditMode.value = false
  editingAttendanceId.value = null

  form.value = {
    userType: '',
    userId: '',
    status: 'Present',
    checkInTime: '',
    remarks: '',
    classId: null
  }

  formRef.value?.reset()
}

const closeDialog = () => {
  resetForm()
  showDialog.value = false
}


const dayLabels = ref([])

const generateDayLabels = () => {
  const labels = []
  const today = new Date()
  const startDate = new Date()
  startDate.setDate(today.getDate() - 29) // inclusive

  for (let i = 0; i < 30; i++) {
    const d = new Date(startDate)
    d.setDate(startDate.getDate() + i)
    labels.push(
      d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short'
      })
    ) // e.g., "05 Jul"
  }

  dayLabels.value = labels
}
generateDayLabels()

// Refs to hold fetched data
const trends = ref({
  student: [],
  teacher: [],
  employee: [],
  total: []
})

const dailySummary = ref([])
const recentLogs = ref([])
const tabs = ['all']
const activeTab = ref('all')
const loading = ref(false)

// Define a date range for trends
const today = new Date()
const startDate = new Date(today)
startDate.setDate(today.getDate() - 30) // 30 days ago

const todayISO = new Date().toISOString().slice(0, 10)







const getCurrentWorkWeek = () => {
  const today = new Date()

  // JS: Monday = 1, Sunday = 0, so fix Sunday behavior
  const day = today.getDay() === 0 ? 7 : today.getDay()

  const monday = new Date(today)
  monday.setDate(today.getDate() - (day - 1)) // move back to Monday

  const friday = new Date(monday)
  friday.setDate(monday.getDate() + 4) // Friday = Monday + 4 days

  const format = (d) => d.toISOString().split('T')[0]

  return {
    start: format(monday),
    end: format(friday)
  }
}

const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']






const isLoading = ref(true)


const formattedDate = today.toLocaleDateString('en-GB', {
  day: '2-digit',
  month: 'long',
  year: 'numeric'
})

const summaryDisplay = computed(() =>
  dailySummary.value
    .filter((item) => ['student', 'teacher', 'employee'].includes(item.user_type))
    .map((item) => {
      const { present_count, total_users, user_type } = item
      const percentage = total_users > 0 ? (present_count / total_users) * 100 : 0

      const map = {
        student: {
          label: 'Students',
          color: 'green',
          rawColor: '#10B981',
          icon: 'mdi mdi-school-outline',
          textColor: 'text-green-600'
        },
        teacher: {
          label: 'Teachers',
          color: 'yellow',
          rawColor: '#F59E0B',
          icon: 'mdi mdi-account-tie',
          textColor: 'text-yellow-700'
        },
        employee: {
          label: 'Staffs',
          color: 'indigo',
          rawColor: '#6366F1',
          icon: 'mdi mdi-briefcase-outline',
          textColor: 'text-indigo-600'
        }
      }

      return {
        ...item,
        percentage,
        present: present_count,
        total: total_users,
        ...map[user_type]
      }
    })
)

const stackedBarOptions = (title) => {
  return {
    chart: {
      type: 'bar',
      stacked: true,
      toolbar: { show: false },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 600
      }
    },

    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 6,
        columnWidth: '45%',
        dataLabels: {
          position: 'top'
        }
      }
    },

    // Beautiful modern colors
    colors: ['#10B981', '#EF4444', '#F59E0B'], // Present, Absent, Late

    dataLabels: {
      enabled: false
    },

    stroke: {
      show: false
    },

    // REMOVE horizontal lines
    grid: {
      show: false
    },

    xaxis: {
      categories: weekdayLabels,
      labels: {
        style: {
          fontSize: '12px',
          fontWeight: 500,
          colors: '#6B7280' // neutral gray
        }
      },
      axisBorder: {
        show: true,
        color: '#E5E7EB'
      },
      axisTicks: { show: false }
    },

    yaxis: {
      show: true,
      forceNiceScale: true,
      decimalsInFloat: 0,
      labels: {
        formatter: (val) => Math.round(val), // 👈 forces whole numbers
        style: {
          fontSize: '12px',
          fontWeight: 500,
          colors: '#6B7280'
        }
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },

    legend: {
      position: 'top',
      fontSize: '13px',
      labels: {
        colors: '#374151'
      },
      markers: {
        width: 10,
        height: 10,
        radius: 12
      }
    },

    fill: {
      opacity: 0.95
    },

    tooltip: {
      theme: 'light',
      style: {
        fontSize: '13px'
      },
      y: {
        formatter: (value) => `${value}`
      }
    },

    title: {
      text: title,
      align: 'left',
      style: {
        fontSize: '15px',
        fontWeight: '600',
        color: '#111827'
      }
    }
  }
}


</script>

<template>
  <MainLayout>
    <div
      class="bg-white flex flex-col sm:flex-row rounded shadow justify-between items-start sm:items-center border-b p-4 mb-4"
    >
      <div class="mb-4 sm:mb-0">
        <p class="text-md font-bold">Attendance</p>
        <p class="text-gray-500 text-sm mt-1">View and Manage your attendance records</p>
      </div>

      <v-btn
        @click="openAddDialog"
        size="medium"
        class="normal-case custom-btn hover:bg-green-700 text-white text-sm font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-md shadow-md w-full sm:w-auto flex justify-center items-center"
      >
        <span
          class="bg-white text-blue-600 rounded-full p-1 flex items-center justify-center w-4 h-4 mr-2"
        >
          <i class="fa-solid fa-plus text-sm text-[#214ec8]"></i>
        </span>
        Add new record
      </v-btn>
    </div>
    <!-- <div
      v-if="isLoading"
      class="fill-height d-flex justify-center align-center mx-auto items-center flex my-auto mx-auto"
    >
      <LoadingOverlay :visible="isLoading" message="Loading attendance" />
    </div> -->

    <div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white rounded shadow m-2 p-4 flex flex-col">
          <div class="flex justify-between">
            <h3 class="text-sm text-gray-500 font-bold mb-4">Recent Attendance</h3>

          
          </div>

          <!-- Tabs -->
          <div class="flex space-x-4 mb-4 border-b pb-2">
            <button
              v-for="tab in tabs"
              :key="tab"
              @click="activeTab = tab"
              :class="[
                'capitalize px-3 py-1 rounded-md text-sm',
                activeTab === tab
                  ? 'bg-green-100 text-green-600 font-semibold'
                  : 'bg-gray-100 text-gray-600'
              ]"
            >
              {{ tab }}
            </button>
          </div>

          <!-- Attendance List Scrollable -->
          
        </div>

        <div class="bg-white p-4 rounded shadow m-2">
          <h3 class="text-sm text-gray-500 font-bold mb-1">Today's Attendance</h3>
          <p class="text-xs text-gray-400 mb-4">{{ formattedDate }}</p>

          
        </div>

        <div class="bg-white p-4 rounded shadow m-2">
          <div class="flex justify-between">
            <h3 class="text-sm text-gray-500 font-bold mb-2">Staffs Attendance For this week</h3>

      
          </div>

          
        </div>

        

    
      </div>
    </div>

    <!-- ✅ Attendance Add Dialog -->
    <v-dialog v-model="showDialog" max-width="500px" persistent>
      <v-card class="p-4">
        <v-card-title class="text-lg font-semibold">
          {{ isEditMode ? 'Edit Attendance Record' : 'Add Attendance Record' }}
        </v-card-title>

        <v-card-text>
          <v-form ref="formRef" v-model="formValid" lazy-validation :disabled="submitting">
            <!-- User Type -->
            <v-select
              v-model="form.userType"
              :items="userTypes"
              label="User Type"
              :rules="[rules.userType]"
              variant="outlined"
              color="green"
              @update:model-value="onUserTypeChange"
            />

            <!-- User -->
            <v-select
            
              
              item-title="name"
              item-value="id"
              label="User"
              
              variant="outlined"
              color="green"
              class="mt-3"
            />

            <!-- Class (only for students) -->
            <!-- <v-select
              v-if="form.userType === 'student'"
              v-model="form.classId"
              :items="classesList"
              item-title="name"
              item-value="id"
              label="Class"
              variant="outlined"
              color="green"
              class="mt-3"
              :rules="[rules.required]"
              :loading="loadingClasses"
            /> -->

            <!-- Status -->
            <v-select
              
              :items="['Present', 'Late']"
              label="Status"
              variant="outlined"
              color="green"
              class="mt-3"
            />

            <!-- Check-in Time -->
            <v-text-field
              
              label="Check-in Time"
              type="time"
              variant="outlined"
              color="green"
              class="mt-3"
            />

            <!-- Remarks -->
            <v-textarea
              
              label="Remarks"
              rows="2"
              variant="outlined"
              color="green"
              class="mt-3"
            />
          </v-form>
        </v-card-text>

        <v-card-actions class="justify-end space-x-2">
          <v-btn text color="grey" @click="showDialog = false">Cancel</v-btn>
          <v-btn
            :loading="submitting"
            color="green"
            @click="submitAttendance"
            :disabled="!formValid || submitting"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </MainLayout>
</template>

<style scoped>
.custom-btn {
  background-color: #214ec8;
  text-transform: none;
}
.v-btn {
  text-transform: none;
}
</style>
