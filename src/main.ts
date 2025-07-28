import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import Antd from 'ant-design-vue';
// import 'ant-design-vue/dist/reset.css';
import './assets/main.css'

const app = createApp(App)

app.use(Antd);

app.mount('#app')
