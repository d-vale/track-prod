import { createRouter, createWebHashHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Tracking from '../views/Tracking.vue';
import Profile from '../views/Profile.vue';
import Home from '../views/Home.vue';
import ActivityDetail from '../views/ActivityDetail.vue';
import Register from '../views/Register.vue';


const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/tracking',
    name: 'Tracking',
    component: Tracking
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile
  },
  {
    path: '/home',
    name: 'Home',
    component: Home
  },
  {
    path: '/activity/:id',
    name: 'ActivityDetail',
    component: ActivityDetail,
    props: true
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
