import ApiService from '@/services/api'

export interface AttendancePayload {
  status: string
  lat: number
  lng: number
  device?: string
}

export interface AttendanceResponse {
  success: boolean
  message?: string
  data?: any
}

class AttendanceService {
  /**
   * Mark attendance (check-in / late / etc.)
   */
  async markAttendance(payload: AttendancePayload): Promise<AttendanceResponse> {
    return await ApiService.post('/attendance', payload)
  }

  /**
   * Get recent attendance logs
   */
  async getRecentLogs(limit = 10) {
    return await ApiService.get(`/attendance/logs?limit=${limit}`)
  }

  /**
   * Get attendance summary (dashboard stats)
   */
  async getSummary(params?: { startDate?: string; endDate?: string }) {
    const query = new URLSearchParams(params as any).toString()
    return await ApiService.get(`/attendance/summary?${query}`)
  }

  /**
   * Get user attendance history
   */
  async getUserAttendance(userId: string) {
    return await ApiService.get(`/attendance/user/${userId}`)
  }

  /**
   * Admin: override attendance
   */
  async updateAttendance(id: string, payload: any) {
    return await ApiService.put(`/attendance/${id}`, payload)
  }

  /**
   * Delete attendance record
   */
  async deleteAttendance(id: string) {
    return await ApiService.delete(`/attendance/${id}`)
  }
}

export default new AttendanceService()
