import api from './api';


export const authService = {
  async signup(payload) {
    const { data } = await api.post('/register', {
      teamName: payload.teamName,
      email: payload.email,
      password: payload.password,
      firstName: payload.firstName,
      lastName: payload.lastName
    })

    localStorage.setItem('token', data.token)
    return data
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