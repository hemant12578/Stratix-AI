import axios from 'axios'

const trimTrailingSlash = (value = '') => value.replace(/\/+$/, '')

const envBase = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL || '')
// In production, set VITE_API_BASE_URL to your Railway backend URL.
const defaultBase = import.meta.env.DEV ? 'http://localhost:8000' : ''

axios.defaults.baseURL = envBase || defaultBase
axios.defaults.timeout = 120000

export default axios
