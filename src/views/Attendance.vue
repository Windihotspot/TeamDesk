<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import MainLayout from '@/layouts/full/MainLayout.vue'
import { supabase } from '@/services/supabase.js'
import Apexchart from 'vue3-apexcharts'
import AttendanceService from '@/services/attendance.service'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
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

const usersList = ref([])
const loadingUsers = ref(false)
const attendance = ref([])

const loadUsers = async () => {
  loadingUsers.value = true

  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, avatar_url, email')

    if (error) throw error

    usersList.value = (data || []).map((u) => ({
      id: u.id,
      name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email,
      avatar: u.avatar_url
    }))
  } catch (err) {
    ElMessage.error(err.message)
  } finally {
    loadingUsers.value = false
  }
}
onMounted(() => {
  loadUsers()
})
// ✅ Validation Rules
const rules = {
  required: (v) => !!v || 'This field is required',
  userType: (v) => !!v || 'Select a user type',
  userId: (v) => !!v || 'Select a user'
}

const openAddDialog = async () => {
  showDialog.value = true
  await loadUsers()
}

const openEditDialog = async (log) => {
  isEditMode.value = true
  editingAttendanceId.value = log.id

  // Set type FIRST
  form.value.userType = log.user_type

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

const todaySummary = computed(() => {
  const today = recentLogs.value.filter((l) => l.date === new Date().toISOString().slice(0, 10))

  return {
    present: today.filter((t) => t.status === 'present').length,
    late: today.filter((t) => t.status === 'late').length,
    total: today.length
  }
})

const weekdayLabels = computed(() => weeklyData.value.map((d) => d.day))

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

const stackedBarOptions = () => ({
  chart: {
    type: 'bar',
    stacked: true,
    toolbar: { show: false },
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800
    }
  },

  plotOptions: {
    bar: {
      horizontal: false,
      borderRadius: 8,
      columnWidth: '40%',
      endingShape: 'rounded'
    }
  },

  colors: [
    '#22C55E', // Present (green)
    '#F59E0B', // Late (amber)
    '#EF4444' // Absent (red)
  ],

  grid: {
    borderColor: '#f1f5f9',
    strokeDashArray: 4
  },

  xaxis: {
    categories: weekdayLabels.value,
    labels: {
      style: {
        fontSize: '13px',
        fontWeight: 600
      }
    }
  },

  yaxis: {
    labels: {
      formatter: (val) => Math.round(val)
    }
  },

  legend: {
    position: 'top',
    horizontalAlign: 'right'
  },

  tooltip: {
    shared: true,
    intersect: false,
    y: {
      formatter: (val) => `${val} users`
    }
  }
})

const getLocation = () => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject)
  })
}

const submitAttendance = async () => {
  submitting.value = true

  const DEBUG = true

  // 🔥 Change this to test different scenarios
  const TEST_MODE = 'NONE'
  // OPTIONS:
  // 'NONE'
  // 'OUTSIDE_RADIUS'
  // 'INVALID_STATUS'
  // 'MISSING_FIELDS'
  // 'INVALID_COORDS'
  // 'EMPTY'
  // 'NO_LOCATION'

  try {
    if (DEBUG) console.log('🚀 Starting attendance submission...')

    // ⛔ simulate location denial
    if (TEST_MODE === 'NO_LOCATION') {
      throw new Error('User denied location access')
    }

    // 📍 get real location
    const pos = await getLocation()

    let payload = {
      status: form.value.status.toLowerCase(),
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      device: navigator.userAgent
    }

    // =========================
    // 🧪 TEST CASE SWITCH
    // =========================
    switch (TEST_MODE) {
      case 'OUTSIDE_RADIUS':
        payload.lat = 6.6
        payload.lng = 3.2
        break

      case 'INVALID_STATUS':
        payload.status = 'flying'
        break

      case 'MISSING_FIELDS':
        delete payload.status
        break

      case 'INVALID_COORDS':
        payload.lat = 999
        payload.lng = 999
        break

      case 'EMPTY':
        payload = {}
        break
    }

    // =========================
    // 🧾 DEBUG LOGGING
    // =========================
    if (DEBUG) {
      console.group('📤 ATTENDANCE REQUEST')
      console.log('Mode:', TEST_MODE)
      console.log('Payload:', payload)
      console.log('Time:', new Date().toISOString())
      console.log('User:', auth?.user?.id)
      console.groupEnd()
    }

    // 🚀 API CALL
    const res = await AttendanceService.markAttendance(payload)

    if (DEBUG) {
      console.group('📥 ATTENDANCE RESPONSE')
      console.log('Response:', res)
      console.groupEnd()
    }

    ElMessage.success('✅ Attendance marked successfully')

    fetchAttendanceData()
    fetchWeeklyAttendance()
    closeDialog()
  } catch (err) {
    console.group('❌ ATTENDANCE ERROR')

    console.error('Raw error:', err)

    const backendError =
      err?.response?.data?.error || err?.data?.error || err?.message || 'Something went wrong'

    console.log('Parsed error:', backendError)

    if (err?.response) {
      console.log('Status:', err.response.status)
      console.log('Full response:', err.response.data)
    }

    console.groupEnd()

    ElMessage.error(`${backendError}`)
  } finally {
    submitting.value = false

    if (DEBUG) console.log('🏁 Attendance request finished')
  }
}

const TEST_MODE = 'OUTSIDE_RADIUS'

const fetchAttendanceData = async () => {
  isLoading.value = true

  try {
    const { data, error } = await supabase
      .from('attendance_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
    console.log('attendance data:', data)
    if (!error) {
      recentLogs.value = data
    }
  } catch (err) {
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

const weeklyData = ref([])
const loadingChart = ref(false)

const fetchWeeklyAttendance = async () => {
  loadingChart.value = true

  try {
    const { data, error } = await supabase.rpc('get_weekly_attendance')

    if (error) throw error

    weeklyData.value = data || []

    console.log('📊 Weekly attendance:', weeklyData.value)
  } catch (err) {
    console.log(err)
    ElMessage.error('Failed to load weekly attendance')
  } finally {
    loadingChart.value = false
  }
}

const weeklyChartSeries = computed(() => {
  return [
    {
      name: 'Present',
      data: weeklyData.value.map((d) => d.present_count)
    },
    {
      name: 'Late',
      data: weeklyData.value.map((d) => d.late_count)
    },
    {
      name: 'Absent',
      data: weeklyData.value.map((d) => d.absent_count)
    }
  ]
})
onMounted(() => {
  fetchAttendanceData()
  fetchWeeklyAttendance()
})
</script>

<template>
  <MainLayout>
    <!-- FULL PAGE LOADER -->
    <div
      v-if="isLoading"
      class="fixed inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50"
    >
      <v-progress-circular indeterminate color="blue" size="60" width="2" />

      <p class="mt-4 text-sm text-gray-500 font-medium">Loading attendance data...</p>
    </div>

    <div v-else>
      <div
        class="bg-white flex flex-col sm:flex-row rounded shadow justify-between items-start sm:items-center border-b p-4 mb-4"
      >
        <div class="mb-4 sm:mb-0">
          <p class="text-md font-bold">Attendance</p>
          <p class="text-gray-500 text-sm mt-1">View and Manage your attendance records</p>
        </div>

        <v-btn
          @click="openAddDialog"
          size="large"
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
        <div class="">
          <div class="bg-white p-5 rounded-lg m-2 mb-4 border border-gray-100 md:col-span-2">
            <div class="flex justify-between items-center mb-4">
              <div>
                <h3 class="text-sm font-semibold text-gray-700">Today's Attendance</h3>
                <p class="text-xs text-gray-400">{{ formattedDate }}</p>
              </div>

              <div class="text-right">
                <p class="text-xs text-gray-400">Total</p>
                <p class="text-lg font-bold text-gray-800">
                  {{ todaySummary.total }}
                </p>
              </div>
            </div>

            <!-- Summary Cards -->
            <div class="grid grid-cols-3 gap-3 mb-4">
              <div class="bg-green-50 rounded-lg p-3 text-center">
                <p class="text-xs text-gray-500">Present</p>
                <p class="text-lg font-bold text-green-600">
                  {{ todaySummary.present }}
                </p>
              </div>

              <div class="bg-yellow-50 rounded-lg p-3 text-center">
                <p class="text-xs text-gray-500">Late</p>
                <p class="text-lg font-bold text-yellow-600">
                  {{ todaySummary.late }}
                </p>
              </div>

              <div class="bg-red-50 rounded-lg p-3 text-center">
                <p class="text-xs text-gray-500">Absent</p>
                <p class="text-lg font-bold text-red-500">
                  {{ Math.max(todaySummary.total - (todaySummary.present + todaySummary.late), 0) }}
                </p>
              </div>
            </div>
          </div>

          <div class="bg-white p-4 rounded-lg mt-4 m-2">
            <div class="flex justify-between">
              <h3 class="text-sm text-gray-500 font-bold mb-2">Staffs Attendance For this week</h3>
            </div>

            <Apexchart
              type="bar"
              height="300"
              :options="stackedBarOptions()"
              :series="weeklyChartSeries"
            />
          </div>

          <!-- Recent List -->
          <v-card class="m-2 elevation-1">
            <v-card-title class="text-xs font-semibold"
              ><p>Recent Attendance Logs</p>
            </v-card-title>

            <v-divider />

            <v-data-table
              :items="recentLogs"
              :headers="headers"
              density="compact"
              class="elevation-0"
              fixed-header
              height="400"
            >
              <template #item.status="{ item }">
                <v-chip
                  size="x-small"
                  :color="
                    item.status === 'present' ? 'green' : item.status === 'late' ? 'orange' : 'red'
                  "
                  text-color="white"
                >
                  {{ item.status }}
                </v-chip>
              </template>

              <template #item.check_in_time="{ item }">
                {{ item.check_in_time?.slice(11, 16) || '--:--' }}
              </template>

              <template #item.ip_address="{ item }">
                {{ item.ip_address || 'offline' }}
              </template>
            </v-data-table>
          </v-card>
        </div>
      </div>
    </div>

    <!-- ✅ Attendance Add Dialog -->
    <v-dialog v-model="showDialog" max-width="500px" persistent>
      <v-card class="p-4">
        <v-card-title class="text-md font-semibold">
          {{ isEditMode ? 'Edit Attendance Record' : 'Add Attendance Record' }}
        </v-card-title>

        <v-card-text>
          <v-form ref="formRef" v-model="formValid" lazy-validation :disabled="submitting">
            <v-select
              v-model="form.userId"
              :items="usersList"
              item-title="name"
              item-value="id"
              label="User"
              variant="outlined"
              color="green"
              class="mt-3"
              :loading="loadingUsers"
            />

            <v-select
              v-model="form.status"
              :items="['Present', 'Late']"
              label="Status"
              variant="outlined"
              color="green"
              class="mt-3"
            />

            <v-text-field
              v-model="form.checkInTime"
              label="Check-in Time"
              type="time"
              variant="outlined"
              color="green"
              class="mt-3"
            />

            <v-textarea
              v-model="form.remarks"
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
  background-color: #0f4c81;
  text-transform: none;
}
.v-btn {
  text-transform: none;
}
</style>
