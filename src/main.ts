import { createApp } from 'vue';
import App from './App.vue'
import { createPinia } from 'pinia';

import 'vuetify/styles/main.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import '@mdi/font/css/materialdesignicons.css'
import './style.css'


createApp(App)
  .use(createPinia())
  .use(createVuetify({
    defaults: {
      global: {
        density: 'compact',
      }
    },
    components,
    directives,
  }))
  .mount('#app');
