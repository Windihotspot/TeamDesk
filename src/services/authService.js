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
    const { data } = await api.post('/login', {
      email: payload.email,
      password: payload.password
    })

    localStorage.setItem('token', data.token)
    return data
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