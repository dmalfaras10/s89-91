<script setup>
  import Navbar from './components/Navbar.vue';
  import Footer from './components/Footer.vue';

    import { useGlobalStore } from "./stores/global";
    import {onBeforeMount} from 'vue';
    
    const { getUserDetails } = useGlobalStore();

    onBeforeMount(()=>getUserDetails(localStorage.getItem("token")));
</script>

<template>
  <Navbar />
  <div class="container">
      <router-view/>
  </div>
  <Footer />
</template>
