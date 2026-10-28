import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(`API Error ${error.response.status}:`, error.response.data)
    }
    return Promise.reject(error)
  }
)

export default api
