import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import axios from 'axios'

// Global Axios Interceptor
axios.interceptors.request.use(config => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Navigate to login on 401
axios.interceptors.response.use(response => response, error => {
    if (error.response && error.response.status === 401) {
        localStorage.removeItem('access_token');
        window.location.reload();
    }
    return Promise.reject(error);
});

createApp(App).mount('#app')
