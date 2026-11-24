<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useGlobalStore } from "../stores/global.js";

const router = useRouter();
const { user, getUserDetails } = useGlobalStore();
const isLoggedIn = computed(() => !!user.token);

function handleLogout() {
  localStorage.removeItem("token");
  getUserDetails(null);
  router.push({ name: "Login" });
}
</script>

<template>
  <nav class="navbar navbar-expand-lg sticky-top navbar-shell shadow-sm py-3">
    <div class="container flex-wrap flex-lg-nowrap align-items-center">
      <!-- Mobile & Tablet Top Bar: Left Hamburger | Center Brand | Right Account Icon -->
      <div class="d-flex d-lg-none align-items-center justify-content-between w-100 navbar-mobile-bar">
        <button
          class="navbar-toggler border-0 shadow-none px-2"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavAltMarkup"
          aria-controls="navbarNavAltMarkup"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <router-link
          to="/"
          class="navbar-brand fw-bold fs-3 d-flex align-items-center gap-2 navbar-brand-text navbar-brand-mobile m-0"
        >
          <i class="bi bi-journal-richtext navbar-brand-icon"></i>
          <span>Blogy</span>
        </router-link>

        <div v-if="isLoggedIn" class="nav-item dropdown navbar-mobile-account">
          <button
            class="btn navbar-btn-account-icon d-inline-flex align-items-center justify-content-center rounded-circle p-0"
            type="button"
            id="userMenuDropdownMobile"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            aria-label="Account menu"
          >
            <i class="bi bi-person-circle fs-4"></i>
          </button>

          <ul
            class="dropdown-menu dropdown-menu-end navbar-dropdown shadow-sm mt-2 p-2"
            aria-labelledby="userMenuDropdownMobile"
          >
            <li>
              <button
                type="button"
                class="dropdown-item navbar-dropdown-item navbar-dropdown-logout rounded-2 py-2 fw-semibold"
                @click="handleLogout"
              >
                <i class="bi bi-box-arrow-right me-2"></i> Logout
              </button>
            </li>
          </ul>
        </div>
        <div v-else class="navbar-mobile-spacer"></div>
      </div>

      <!-- Desktop Brand -->
      <router-link
        to="/"
        class="navbar-brand d-none d-lg-flex fw-bold fs-3 align-items-center gap-2 navbar-brand-text me-3"
      >
        <i class="bi bi-journal-richtext navbar-brand-icon"></i>
        <span>Blogy</span>
      </router-link>

      <!-- Collapsible Nav Links & Auth Controls -->
      <div class="collapse navbar-collapse w-100 w-lg-auto" id="navbarNavAltMarkup">
        <!-- Main Nav Links -->
        <div class="navbar-nav mx-lg-auto align-items-lg-center gap-lg-2 mt-2 mt-lg-0">
          <router-link to="/" class="nav-link navbar-link fs-5" active-class="active">
            Home
          </router-link>

          <!-- View Blogs -->
          <router-link
            v-if="!user.isAdmin"
            to="/blogs"
            class="nav-link navbar-link fs-5"
            active-class="active"
          >
            <i class="bi bi-journal-text me-1"></i> Blogs
          </router-link>

          <!-- Admin Blog Management -->
          <template v-if="isLoggedIn && user.isAdmin">
            <router-link to="/blogs" class="nav-link navbar-link fs-5" active-class="active">
              <i class="bi bi-sliders me-1"></i> Manage Blogs
            </router-link>
          </template>

          <router-link to="/about" class="nav-link navbar-link fs-5" active-class="active">
            About
          </router-link>
        </div>

        <!-- Desktop Right Side Auth / Account Controls -->
        <div class="d-flex align-items-center justify-content-lg-end gap-2 mt-3 mt-lg-0">
          <!-- Logged Out: Login & Register -->
          <template v-if="!isLoggedIn">
            <router-link to="/login" class="btn navbar-btn-outline px-4 py-2 rounded-pill fs-6 fw-semibold">
              Login
            </router-link>
            <router-link to="/register" class="btn navbar-btn-brand px-4 py-2 rounded-pill fs-6 fw-semibold">
              Register
            </router-link>
          </template>

          <!-- Desktop Logged In: Icon-Only Account Dropdown -->
          <template v-else>
            <div class="nav-item dropdown d-none d-lg-block">
              <button
                class="btn navbar-btn-account-icon d-inline-flex align-items-center justify-content-center rounded-circle p-0"
                type="button"
                id="userMenuDropdownDesktop"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                aria-label="Account menu"
              >
                <i class="bi bi-person-circle fs-4"></i>
              </button>

              <ul
                class="dropdown-menu dropdown-menu-end navbar-dropdown shadow-sm mt-2 p-2"
                aria-labelledby="userMenuDropdownDesktop"
              >
                <li>
                  <button
                    type="button"
                    class="dropdown-item navbar-dropdown-item navbar-dropdown-logout rounded-2 py-2 fw-semibold"
                    @click="handleLogout"
                  >
                    <i class="bi bi-box-arrow-right me-2"></i> Logout
                  </button>
                </li>
              </ul>
            </div>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar-shell {
  background-color: var(--bg-surface);
  border-bottom: 1px solid var(--border-light);
}

.navbar-brand-text {
  color: var(--text-primary);
  transition: color 0.2s ease;
}

.navbar-brand-text:hover {
  color: var(--accent-primary);
}

.navbar-brand-icon {
  color: var(--accent-primary);
}

.navbar-link {
  color: var(--text-secondary);
  font-weight: 500;
  padding: 0.45rem 0.9rem;
  border-radius: 0.5rem;
  transition: color 0.2s ease, background-color 0.2s ease;
}

.navbar-link:hover {
  color: var(--accent-primary);
  background-color: var(--bg-subtle);
}

.navbar-link.active {
  color: var(--accent-primary);
  background-color: var(--accent-soft);
  font-weight: 600;
}

/* Auth Buttons */
.navbar-btn-outline {
  color: var(--accent-primary);
  background-color: transparent;
  border: 1.5px solid var(--accent-primary);
  transition: all 0.2s ease;
}

.navbar-btn-outline:hover {
  color: var(--accent-hover);
  background-color: var(--accent-soft);
  border-color: var(--accent-hover);
}

.navbar-btn-brand {
  color: #ffffff;
  background-color: var(--accent-primary);
  border: 1.5px solid var(--accent-primary);
  transition: all 0.2s ease;
}

.navbar-btn-brand:hover {
  color: #ffffff;
  background-color: var(--accent-hover);
  border-color: var(--accent-hover);
}

/* Account Icon & Dropdown */
.navbar-btn-account-icon {
  width: 2.5rem;
  height: 2.5rem;
  color: var(--text-primary);
  background-color: var(--bg-subtle);
  border: 1px solid var(--border-light);
  transition: all 0.2s ease;
}

.navbar-btn-account-icon:hover,
.navbar-btn-account-icon:focus {
  color: var(--accent-primary);
  background-color: var(--accent-soft);
  border-color: var(--accent-primary);
}

.navbar-dropdown {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-light);
  min-width: 11rem;
}

.navbar-dropdown-item {
  color: var(--text-primary);
  transition: background-color 0.2s ease, color 0.2s ease;
}

.navbar-dropdown-logout {
  color: var(--status-danger);
}

.navbar-dropdown-logout:hover,
.navbar-dropdown-logout:focus {
  background-color: var(--bg-subtle);
  color: var(--status-danger);
}

/* Keeps mobile brand centered when account icon is hidden */
.navbar-mobile-spacer {
  width: 2.5rem;
}
</style>