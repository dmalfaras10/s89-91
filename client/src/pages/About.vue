<script setup>
import { computed } from "vue";
import { useGlobalStore } from "../stores/global.js";

const { user } = useGlobalStore();
const isLoggedIn = computed(() => Boolean(user?.token || user?.id));

const pillars = [
  {
    number: "01",
    icon: "bi-book-half",
    title: "Thoughtful Long-Form Reading",
    description:
      "Designed with a calm, warm reading surface and clean typography so articles feel easy on the eyes from start to finish."
  },
  {
    number: "02",
    icon: "bi-pencil-square",
    title: "Practical Writing & Guides",
    description:
      "From step-by-step technical walkthroughs to everyday lessons learned, Blogy focuses on clear, useful ideas."
  },
  {
    number: "03",
    icon: "bi-chat-dots",
    title: "Constructive Conversations",
    description:
      "Readers can share perspectives through post comments while authors and administrators keep discussions welcoming and focused."
  }
];

const stackItems = [
  {
    icon: "bi-window-sidebar",
    name: "Vue 3 & Pinia",
    role: "Reactive UI, state & client routing"
  },
  {
    icon: "bi-hdd-network",
    name: "Express & Node.js",
    role: "RESTful API & JWT authentication"
  },
  {
    icon: "bi-database",
    name: "MongoDB Atlas",
    role: "Persistent posts, users & comments"
  },
  {
    icon: "bi-layout-wtf",
    name: "Bootstrap 5 & Notyf",
    role: "Responsive grid & instant feedback"
  }
];
</script>

<template>
  <div class="about-page">
    <!-- Editorial Split Hero -->
    <section class="about-hero py-5">
      <div class="container py-lg-4">
        <div class="row align-items-center gy-4">
          <div class="col-12 col-lg-7">
            <div class="about-eyebrow mb-3">
              <span class="about-eyebrow__dot"></span>
              <span>About Blogy</span>
            </div>

            <h1 class="about-title display-4 fw-bold mb-3">
              A quiet corner on the web for clear ideas and honest writing.
            </h1>

            <p class="about-lead lead mb-4">
              <strong>Blogy</strong> is a full-stack publishing space built for readers who enjoy depth without clutter and writers who value a straightforward publishing flow.
            </p>

            <div class="d-flex flex-wrap align-items-center gap-3">
              <router-link
                to="/blogs"
                class="btn about-btn-primary rounded-pill px-4 py-2 fw-semibold"
              >
                Browse Articles <i class="bi bi-arrow-right ms-1"></i>
              </router-link>
              <router-link
                to="/"
                class="btn about-btn-outline rounded-pill px-4 py-2 fw-semibold"
              >
                Back to Home
              </router-link>
            </div>
          </div>

          <!-- Editorial Note Card -->
          <div class="col-12 col-lg-5">
            <aside class="about-note-card rounded-4 overflow-hidden">
              <div class="about-note-card__bar"></div>
              <div class="p-4 p-md-5">
                <span class="about-note-card__tag mb-3 d-inline-block">
                  <i class="bi bi-feather me-1"></i>Editorial Philosophy
                </span>
                <blockquote class="about-quote mb-4">
                  “Good writing doesn’t need algorithmic noise—just legible typography, fast discovery, and space for real replies.”
                </blockquote>
                <div class="about-note-card__meta pt-3 d-flex align-items-center justify-content-between small">
                  <span>Open Access</span>
                  <span>•</span>
                  <span>Zero Paywalls</span>
                  <span>•</span>
                  <span>Community Driven</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>

    <!-- Guiding Principles -->
    <section class="about-pillars py-5">
      <div class="container">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-2 mb-4">
          <div>
            <span class="about-kicker text-uppercase fw-bold small">What Guides Us</span>
            <h2 class="about-heading h2 fw-bold mt-1 mb-0">Built Around Three Principles</h2>
          </div>
          <p class="about-subtext small mb-0">
            Every design choice prioritizes readability and clarity.
          </p>
        </div>

        <div class="row g-4">
          <div v-for="pillar in pillars" :key="pillar.title" class="col-12 col-md-4">
            <article class="about-pillar-card rounded-4 p-4 h-100 d-flex flex-column">
              <div class="d-flex align-items-center justify-content-between mb-4">
                <div class="about-icon-box rounded-3">
                  <i :class="`bi ${pillar.icon} fs-5`"></i>
                </div>
                <span class="about-pillar-num">{{ pillar.number }}</span>
              </div>

              <h3 class="about-heading h5 fw-bold mb-2">{{ pillar.title }}</h3>
              <p class="about-text mb-0 flex-grow-1">{{ pillar.description }}</p>
            </article>
          </div>
        </div>
      </div>
    </section>

    <!-- Mission & Architecture -->
    <section class="about-story py-5">
      <div class="container">
        <div class="row g-4 align-items-stretch">
          <!-- Mission -->
          <div class="col-12 col-lg-6">
            <div class="about-card rounded-4 p-4 p-md-5 h-100 d-flex flex-column justify-content-between">
              <div>
                <span class="about-kicker text-uppercase fw-bold small">Our Mission</span>
                <h2 class="about-heading h3 fw-bold mt-1 mb-3">Why Blogy Exists</h2>
                <p class="about-text mb-3">
                  Modern feeds often reward speed and distraction over substance. Blogy takes the opposite approach: warm surfaces, clear hierarchy, instant keyword filtering, and direct access to full articles and discussions.
                </p>
                <p class="about-text mb-0">
                  Whether you are reading tutorials, sharing project notes, or managing your own published posts, everything stays fast, predictable, and easy to navigate.
                </p>
              </div>

              <div class="about-mission-highlights pt-4 mt-4 d-flex flex-wrap gap-3">
                <span class="about-chip">
                  <i class="bi bi-search me-1"></i>Instant Search
                </span>
                <span class="about-chip">
                  <i class="bi bi-pencil me-1"></i>Author Controls
                </span>
                <span class="about-chip">
                  <i class="bi bi-chat-left-text me-1"></i>Post Threads
                </span>
              </div>
            </div>
          </div>

          <!-- Architecture & Stack -->
          <div class="col-12 col-lg-6">
            <div class="about-card rounded-4 p-4 p-md-5 h-100 d-flex flex-column justify-content-between">
              <div>
                <span class="about-kicker text-uppercase fw-bold small">Under The Hood</span>
                <h2 class="about-heading h3 fw-bold mt-1 mb-3">How It Is Built</h2>

                <div class="row g-3 mb-4">
                  <div v-for="item in stackItems" :key="item.name" class="col-12 col-sm-6">
                    <div class="about-stack-tile rounded-3 p-3 h-100">
                      <div class="about-stack-tile__icon mb-2">
                        <i :class="`bi ${item.icon}`"></i>
                      </div>
                      <div class="fw-bold small about-stack-name mb-1">{{ item.name }}</div>
                      <div class="about-stack-role">{{ item.role }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="about-security-note rounded-3 p-3 d-flex align-items-center gap-2 small">
                <i class="bi bi-shield-check about-security-note__icon fs-5"></i>
                <span>Authenticated sessions use JSON Web Tokens with author and admin role controls.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Bottom Call To Action -->
    <section class="about-cta pb-5">
      <div class="container">
        <div class="about-cta__card rounded-4 p-4 p-md-5 d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-4">
          <div>
            <span class="about-kicker text-uppercase fw-bold small">Get Started</span>
            <h2 class="about-heading h3 fw-bold mt-1 mb-2">
              {{ isLoggedIn ? "Ready to dive back into the feed?" : "Join the Blogy community" }}
            </h2>
            <p class="about-cta__text mb-0">
              {{
                isLoggedIn
                  ? "Explore the latest stories or publish a new post from the community feed."
                  : "Create a free account to publish your own articles and join post discussions."
              }}
            </p>
          </div>

          <div class="d-flex flex-wrap gap-2 flex-shrink-0">
            <router-link to="/blogs" class="btn about-btn-primary rounded-pill px-4 py-2 fw-semibold">
              Explore Blogs
            </router-link>
            <router-link
              v-if="!isLoggedIn"
              to="/register"
              class="btn about-btn-outline rounded-pill px-4 py-2 fw-semibold"
            >
              Create Account
            </router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.about-page {
  background-color: var(--bg-page);
  color: var(--text-primary);
}

/* Shared Typography & Eyebrow */
.about-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--accent-soft);
  color: var(--accent-hover);
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.03em;
}

.about-eyebrow__dot {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 50%;
  background-color: var(--accent-primary);
}

.about-kicker {
  color: var(--accent-primary);
  letter-spacing: 0.06em;
}

.about-title {
  color: var(--text-primary);
  letter-spacing: -0.03em;
  line-height: 1.14;
}

.about-heading {
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.about-lead {
  color: var(--text-secondary);
  line-height: 1.65;
  max-width: 58ch;
}

.about-subtext {
  color: var(--text-muted);
}

.about-text {
  color: var(--text-secondary);
  line-height: 1.7;
}

/* Buttons */
.about-btn-primary {
  background-color: var(--accent-primary);
  border: 1.5px solid var(--accent-primary);
  color: #ffffff;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.about-btn-primary:hover {
  background-color: var(--accent-hover);
  border-color: var(--accent-hover);
  color: #ffffff;
}

.about-btn-outline {
  background-color: var(--bg-surface);
  border: 1.5px solid var(--border-strong);
  color: var(--text-primary);
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.about-btn-outline:hover {
  background-color: var(--accent-soft);
  border-color: var(--accent-primary);
  color: var(--accent-hover);
}

/* Hero & Editorial Quote Card */
.about-hero {
  border-bottom: 1px solid var(--border-light);
}

.about-note-card {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-light);
  box-shadow: 0 16px 36px -20px rgba(28, 25, 23, 0.2);
}

.about-note-card__bar {
  height: 4px;
  background: linear-gradient(90deg, var(--accent-primary), var(--accent-hover));
}

.about-note-card__tag {
  background-color: var(--accent-soft);
  color: var(--accent-hover);
  border-radius: 999px;
  padding: 0.3rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
}

.about-quote {
  color: var(--text-primary);
  font-size: 1.075rem;
  font-weight: 600;
  line-height: 1.6;
  padding-left: 1rem;
  border-left: 3px solid var(--accent-primary);
}

.about-note-card__meta {
  border-top: 1px solid var(--border-light);
  color: var(--text-muted);
  font-weight: 600;
}

/* Principles Section */
.about-pillars {
  background-color: var(--bg-subtle);
  border-bottom: 1px solid var(--border-light);
}

.about-pillar-card {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-light);
  box-shadow: 0 6px 18px -12px rgba(28, 25, 23, 0.14);
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}

.about-pillar-card:hover {
  transform: translateY(-3px);
  border-color: var(--border-strong);
  box-shadow: 0 14px 28px -16px rgba(28, 25, 23, 0.2);
}

.about-icon-box {
  width: 2.75rem;
  height: 2.75rem;
  background-color: var(--accent-soft);
  color: var(--accent-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.about-pillar-num {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--text-muted);
  letter-spacing: 0.04em;
}

/* Mission & Stack Cards */
.about-card {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-light);
  box-shadow: 0 8px 24px -16px rgba(28, 25, 23, 0.16);
}

.about-mission-highlights {
  border-top: 1px solid var(--border-light);
}

.about-chip {
  background-color: var(--bg-subtle);
  color: var(--text-secondary);
  border: 1px solid var(--border-light);
  border-radius: 999px;
  padding: 0.35rem 0.8rem;
  font-size: 0.8rem;
  font-weight: 600;
}

.about-stack-tile {
  background-color: var(--bg-page);
  border: 1px solid var(--border-light);
  transition: border-color 0.15s ease;
}

.about-stack-tile:hover {
  border-color: var(--border-strong);
}

.about-stack-tile__icon {
  color: var(--accent-primary);
  font-size: 1.1rem;
}

.about-stack-name {
  color: var(--text-primary);
}

.about-stack-role {
  font-size: 0.8rem;
  color: var(--text-muted);
  line-height: 1.4;
}

.about-security-note {
  background-color: var(--bg-subtle);
  border: 1px solid var(--border-light);
  color: var(--text-secondary);
}

.about-security-note__icon {
  color: var(--status-success);
  flex-shrink: 0;
}

/* Bottom CTA */
.about-cta__card {
  background: linear-gradient(135deg, var(--bg-surface) 0%, var(--accent-soft) 100%);
  border: 1px solid var(--border-strong);
}

.about-cta__text {
  color: var(--text-secondary);
  max-width: 540px;
}
</style>