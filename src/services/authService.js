import api from './api';


export const authService = {
  async signup(payload) {
    try {
      const response = await api.post('/register', payload)
      console.log(response)
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message

      throw new Error(message)
    }
  },


  async login(payload) {
    try {
      
      const response = await api.post('/login', payload)
      console.log(response)
      console.log(payload)
      return response
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message

      throw new Error(message)
    }
  },

//   logout() {
//     localStorage.removeItem('token')    window.location.href = '/login'
//   },

  getToken() {
    return localStorage.getItem('token')
  },

  isAuthenticated() {
    return !!localStorage.getItem('token')
  }
}