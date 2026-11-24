<script setup>
import { computed } from "vue";
import { useGlobalStore } from "../stores/global.js";

const { user } = useGlobalStore();
const isLoggedIn = computed(() => !!user.token);
const currentYear = new Date().getFullYear();
</script>

<template>
  <footer class="footer-shell mt-auto pt-5 pb-4">
    <div class="container">
      <div class="row gy-4 justify-content-between">
        <!-- Brand & Tagline -->
        <div class="col-12 col-lg-4">
          <router-link
            to="/"
            class="footer-brand d-inline-flex align-items-center gap-2 fw-bold fs-3 text-decoration-none mb-2"
          >
            <i class="bi bi-journal-richtext footer-brand-icon"></i>
            <span>Blogy</span>
          </router-link>
          <p class="footer-description mb-3">
            A space for thoughtful stories, practical tutorials, and everyday ideas. Read, write, and share your perspective.
          </p>
        </div>

        <!-- Explore Links -->
        <div class="col-6 col-md-4 col-lg-2">
          <h6 class="footer-heading text-uppercase fw-bold mb-3">Explore</h6>
          <ul class="list-unstyled d-flex flex-column gap-2 mb-0">
            <li>
              <router-link to="/" class="footer-link">Home</router-link>
            </li>
            <li>
              <router-link to="/blogs" class="footer-link">
                {{ isLoggedIn && user.isAdmin ? "Manage Blogs" : "Blogs" }}
              </router-link>
            </li>
            <li>
              <router-link to="/about" class="footer-link">About</router-link>
            </li>
          </ul>
        </div>

        <!-- Account Links -->
        <div class="col-6 col-md-4 col-lg-2">
          <h6 class="footer-heading text-uppercase fw-bold mb-3">Account</h6>
          <ul class="list-unstyled d-flex flex-column gap-2 mb-0">
            <template v-if="!isLoggedIn">
              <li>
                <router-link to="/login" class="footer-link">Login</router-link>
              </li>
              <li>
                <router-link to="/register" class="footer-link">Register</router-link>
              </li>
            </template>
            <template v-else>
              <li>
                <router-link to="/blogs" class="footer-link">Browse Posts</router-link>
              </li>
              <li v-if="user.isAdmin">
                <router-link to="/blogs" class="footer-link">Admin Panel</router-link>
              </li>
            </template>
          </ul>
        </div>

        <!-- Quick Search / CTA -->
        <div class="col-12 col-md-4 col-lg-3">
          <h6 class="footer-heading text-uppercase fw-bold mb-3">Start Reading</h6>
          <p class="footer-description small mb-3">
            Looking for something specific? Browse the latest posts or join the community.
          </p>
          <router-link
            :to="isLoggedIn ? '/blogs' : '/register'"
            class="btn footer-cta-btn rounded-pill px-4 py-2 fw-semibold"
          >
            {{ isLoggedIn ? "Explore Blogs" : "Join Blogy" }}
          </router-link>
        </div>
      </div>

      <hr class="footer-divider my-4" />

      <!-- Bottom Copyright Bar -->
      <div class="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
        <p class="footer-copyright mb-0">
          &copy; {{ currentYear }} Blogy. All rights reserved.
        </p>
        <div class="d-flex align-items-center gap-3">
          <router-link to="/about" class="footer-bottom-link">About</router-link>
          <router-link to="/blogs" class="footer-bottom-link">Articles</router-link>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer-shell {
  background-color: var(--bg-surface);
  border-top: 1px solid var(--border-light);
  color: var(--text-secondary);
}

.footer-brand {
  color: var(--text-primary);
  transition: color 0.2s ease;
}

.footer-brand:hover {
  color: var(--accent-primary);
}

.footer-brand-icon {
  color: var(--accent-primary);
}

.footer-description {
  color: var(--text-secondary);
  line-height: 1.6;
}

.footer-heading {
  color: var(--text-primary);
  font-size: 0.85rem;
  letter-spacing: 0.06em;
}

.footer-link {
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: var(--accent-primary);
}

.footer-social-btn {
  width: 2.25rem;
  height: 2.25rem;
  color: var(--text-secondary);
  background-color: var(--bg-subtle);
  border: 1px solid var(--border-light);
  text-decoration: none;
  transition: all 0.2s ease;
}

.footer-social-btn:hover {
  color: var(--accent-primary);
  background-color: var(--accent-soft);
  border-color: var(--accent-primary);
}

.footer-cta-btn {
  color: #ffffff;
  background-color: var(--accent-primary);
  border: 1.5px solid var(--accent-primary);
  transition: all 0.2s ease;
}

.footer-cta-btn:hover {
  color: #ffffff;
  background-color: var(--accent-hover);
  border-color: var(--accent-hover);
}

.footer-divider {
  border-color: var(--border-light);
  opacity: 1;
}

.footer-copyright,
.footer-bottom-link {
  color: var(--text-muted);
  font-size: 0.9rem;
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-bottom-link:hover {
  color: var(--accent-primary);
}
</style>