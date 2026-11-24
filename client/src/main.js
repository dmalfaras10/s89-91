import { createApp } from 'vue'
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.min.css';
import 'notyf/notyf.min.css';
import './assets/main.css'
import App from './App.vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router';

import RegisterPage from './pages/Register.vue'
import LoginPage from './pages/Login.vue'
import HomePage from './pages/Home.vue'
import BlogPage from './pages/Blog.vue'
import BlogDetailView from './pages/BlogDetailView.vue'
import AboutPage from './pages/About.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomePage
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginPage
    },
    {
      path: '/register',
      name: 'Register',
      component: RegisterPage
    },
    {
      path: '/blogs',
      name: 'Blog',
      component: BlogPage
    },
    {
      path: "/blogs/:blogId",
      name: "BlogDetail",
      component: BlogDetailView
    },
    {
      path: '/about',
      name: 'About',
      component: AboutPage
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }

    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      };
    }

    return {
      top: 0,
      left: 0,
      behavior: 'smooth'
    };
  }
});

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app');
