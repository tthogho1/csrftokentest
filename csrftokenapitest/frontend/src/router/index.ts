import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import InputForm from '../views/InputForm.vue';
import ConfirmForm from '../views/ConfirmForm.vue';

const routes: RouteRecordRaw[] = [
  { path: '/', component: InputForm },
  { path: '/confirm', component: ConfirmForm },
];

export default createRouter({ history: createWebHistory(), routes });
