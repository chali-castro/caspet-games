import { createApp } from 'vue';
import App from './App.vue'

import 'vuetify/styles/main.css'
import { createVuetify } from 'vuetify'
import '@mdi/font/css/materialdesignicons.css'
import './style.css'


const vuetify = createVuetify();

createApp(App).use(vuetify).mount('#app');
