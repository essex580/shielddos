// Suppress THREE.Clock deprecation warning from globe.gl internals
const originalWarn = console.warn;
console.warn = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('THREE.Clock: This module has been deprecated')) return;
    originalWarn.apply(console, args);
};

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

// Navigate to login on 401, but prevent infinite refresh loops
axios.interceptors.response.use(response => response, error => {
    const isAuthEndpoint = error.config && error.config.url && (error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register'));

    if (error.response && error.response.status === 401 && !isAuthEndpoint) {
        localStorage.removeItem('access_token');
        window.dispatchEvent(new Event('auth-expired'));
    }
    return Promise.reject(error);
});

createApp(App).mount('#app')
