import axios from 'axios'

const api = axios.create({
  baseURL: 'https://api.tenor.com',
})

export default api
