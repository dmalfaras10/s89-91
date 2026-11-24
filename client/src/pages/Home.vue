<script setup>
import { ref, computed, onMounted } from "vue";
import { useGlobalStore } from "../stores/global.js";
import api from "../api.js";

const { user } = useGlobalStore();
const isLoggedIn = computed(() => Boolean(user?.token || user?.id));

const blogs = ref([]);
const isLoading = ref(true);
const activeFaq = ref(0);

const faqs = [
  {
    question: "Is reading articles on Blogy completely free?",
    answer: "Yes. Every published article on Blogy is open and free to read without a subscription or paywall."
  },
  {
    question: "How do I create an account and start contributing?",
    answer: "Click Register in the top navigation bar, enter your email and password, and sign in. Once logged in, you can participate in discussions and publish posts."
  },
  {
    question: "Can I edit or delete a blog post after publishing it?",
    answer: "Yes. Authors can update or remove their own posts anytime, and site administrators can manage posts across the platform from the Blogs view."
  },
  {
    question: "How can I search for specific topics or keywords?",
    answer: "Use the search bar in the navigation bar or the filter box on the Blogs page to search articles by title, content, or author."
  },
  {
    question: "How do comments and moderation work?",
    answer: "Signed-in readers can leave comments on any article. Authors and admins can manage discussions to keep conversations constructive."
  }
];

const featuredBlog = computed(() => blogs.value[0] ?? null);
const gridBlogs = computed(() => blogs.value.slice(1, 7));

async function fetchLatestBlogs() {
  try {
    const res = await api.get("/blogs/getBlogs");
    const list = Array.isArray(res.data) ? res.data : (res.data?.blogs ?? []);
    blogs.value = list.slice(0, 7);
  } catch (err) {
    blogs.value = [];
  } finally {
    isLoading.value = false;
  }
}

function getExcerpt(content = "", maxLength = 135) {
  if (content.length <= maxLength) return content;
  return content.slice(0, maxLength).trim() + "...";
}

function getReadingTime(content = "") {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} min read`;
}

function getAuthorLabel(blog) {
  if (!blog?.author) return "Blogy Author";
  if (typeof blog.author === "object") {
    return blog.author.email ?? blog.author.name ?? "Blogy Author";
  }
  return String(blog.author);
}

function formatDate(blog) {
  const rawDate = blog?.createdDate;
  if (!rawDate) return "";

  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) return String(rawDate);

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function toggleFaq(index) {
  activeFaq.value = activeFaq.value === index ? -1 : index;
}

onMounted(() => {
  fetchLatestBlogs();
});
</script>

<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="home-hero py-5">
      <div class="container py-lg-4">
        <div class="row align-items-center gy-5">
          <!-- Left Copy -->
          <div class="col-12 col-lg-7">
            <div class="home-eyebrow mb-3">
              <span class="home-eyebrow__dot"></span>
              <span>Community Publishing Platform</span>
            </div>

            <h1 class="home-hero__title display-4 fw-bold mb-3">
              Thoughtful writing, shared without the noise.
            </h1>

            <p class="home-hero__subtitle lead mb-4">
              Welcome to <strong>Blogy</strong> — an open journal for practical guides, project notes, and honest essays written by members of our community.
            </p>

            <div class="d-flex flex-wrap align-items-center gap-3 mb-4">
              <router-link
                to="/blogs"
                class="btn home-btn-primary rounded-pill px-4 py-2 fw-semibold"
              >
                Explore All Stories <i class="bi bi-arrow-right ms-1"></i>
              </router-link>

              <router-link
                v-if="!isLoggedIn"
                to="/register"
                class="btn home-btn-secondary rounded-pill px-4 py-2 fw-semibold"
              >
                Create Free Account
              </router-link>

              <router-link
                v-else
                to="/about"
                class="btn home-btn-secondary rounded-pill px-4 py-2 fw-semibold"
              >
                About Blogy
              </router-link>
            </div>

            <!-- Inline Trust Strip -->
            <div class="home-trust-strip d-flex flex-wrap align-items-center gap-4 pt-3">
              <div class="home-trust-item">
                <span class="home-trust-item__num">{{ blogs.length > 0 ? `${blogs.length}+` : 'New' }}</span>
                <span class="home-trust-item__label">Published Stories</span>
              </div>
              <div class="home-trust-divider"></div>
              <div class="home-trust-item">
                <span class="home-trust-item__num">100%</span>
                <span class="home-trust-item__label">Open &amp; Free</span>
              </div>
              <div class="home-trust-divider"></div>
              <div class="home-trust-item">
                <span class="home-trust-item__num">Live</span>
                <span class="home-trust-item__label">Reader Discussions</span>
              </div>
            </div>
          </div>

          <!-- Right Featured Story Card -->
          <div class="col-12 col-lg-5">
            <div v-if="isLoading" class="home-spotlight rounded-4 p-4 p-md-5 placeholder-glow">
              <span class="placeholder col-4 rounded mb-3"></span>
              <h2 class="h4 placeholder col-10 rounded mb-3"></h2>
              <p class="placeholder col-12 rounded mb-2"></p>
              <p class="placeholder col-9 rounded mb-4"></p>
              <span class="placeholder col-5 rounded"></span>
            </div>

            <article v-else-if="featuredBlog" class="home-spotlight rounded-4 overflow-hidden">
              <div class="home-spotlight__bar"></div>
              <div class="p-4 p-md-5">
                <div class="d-flex align-items-center justify-content-between gap-2 mb-3">
                  <span class="home-spotlight__pill">
                    <i class="bi bi-bookmark-star-fill me-1"></i>Editor's Spotlight
                  </span>
                  <span class="small home-muted">
                    {{ getReadingTime(featuredBlog.content) }}
                  </span>
                </div>

                <h2 class="h4 fw-bold home-spotlight__title mb-3">
                  <router-link :to="`/blogs/${featuredBlog._id}`" class="home-title-link text-decoration-none">
                    {{ featuredBlog.title }}
                  </router-link>
                </h2>

                <p class="home-spotlight__excerpt mb-4">
                  {{ getExcerpt(featuredBlog.content, 165) }}
                </p>

                <div class="home-spotlight__footer pt-3 d-flex align-items-center justify-content-between gap-2">
                  <div class="d-flex align-items-center gap-2 min-w-0">
                    <span class="home-avatar">
                      {{ getAuthorLabel(featuredBlog).slice(0, 2).toUpperCase() }}
                    </span>
                    <div class="min-w-0">
                      <div class="small fw-semibold text-truncate home-author-name">
                        {{ getAuthorLabel(featuredBlog) }}
                      </div>
                      <div v-if="formatDate(featuredBlog)" class="home-micro-date">
                        {{ formatDate(featuredBlog) }}
                      </div>
                    </div>
                  </div>

                  <router-link
                    :to="`/blogs/${featuredBlog._id}`"
                    class="home-read-cta small fw-semibold text-decoration-none flex-shrink-0"
                  >
                    Read story →
                  </router-link>
                </div>
              </div>
            </article>

            <!-- Fallback Feature Card if No Posts Yet -->
            <div v-else class="home-spotlight rounded-4 overflow-hidden">
              <div class="home-spotlight__bar"></div>
              <div class="p-4 p-md-5">
                <span class="home-spotlight__pill mb-3 d-inline-block">
                  <i class="bi bi-journal-richtext me-1"></i>Built for Clarity
                </span>
                <h2 class="h4 fw-bold home-spotlight__title mb-2">
                  Your space to publish and connect
                </h2>
                <p class="home-spotlight__excerpt mb-4">
                  Write clean posts, search topics in seconds, and engage directly with readers in threaded comments.
                </p>
                <router-link to="/blogs" class="home-read-cta small fw-semibold text-decoration-none">
                  Visit the Community Feed →
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Strip -->
    <section class="home-pillars py-4">
      <div class="container">
        <div class="row g-3">
          <div class="col-12 col-md-4">
            <div class="home-pillar rounded-3 p-3 d-flex align-items-start gap-3">
              <div class="home-pillar__icon rounded-3 flex-shrink-0">
                <i class="bi bi-book"></i>
              </div>
              <div>
                <h2 class="h6 fw-bold mb-1 home-pillar__title">Read Without Barriers</h2>
                <p class="small mb-0 home-pillar__text">Every post is completely free—no paywalls, pop-ups, or subscriptions.</p>
              </div>
            </div>
          </div>

          <div class="col-12 col-md-4">
            <div class="home-pillar rounded-3 p-3 d-flex align-items-start gap-3">
              <div class="home-pillar__icon rounded-3 flex-shrink-0">
                <i class="bi bi-pencil-square"></i>
              </div>
              <div>
                <h2 class="h6 fw-bold mb-1 home-pillar__title">Publish &amp; Manage</h2>
                <p class="small mb-0 home-pillar__text">Share stories in seconds and edit or refine your posts anytime.</p>
              </div>
            </div>
          </div>

          <div class="col-12 col-md-4">
            <div class="home-pillar rounded-3 p-3 d-flex align-items-start gap-3">
              <div class="home-pillar__icon rounded-3 flex-shrink-0">
                <i class="bi bi-chat-dots"></i>
              </div>
              <div>
                <h2 class="h6 fw-bold mb-1 home-pillar__title">Discuss Together</h2>
                <p class="small mb-0 home-pillar__text">Leave feedback, ask questions, and build conversations under every post.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Latest Articles Grid -->
    <section class="home-latest py-5">
      <div class="container">
        <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-end gap-2 mb-4">
          <div>
            <span class="home-kicker text-uppercase fw-bold small">Fresh Off The Press</span>
            <h2 class="home-heading h2 fw-bold mb-0 mt-1">Latest Articles</h2>
          </div>
          <router-link to="/blogs" class="home-view-all fw-semibold text-decoration-none">
            Browse full archive <i class="bi bi-arrow-right ms-1"></i>
          </router-link>
        </div>

        <!-- Loading Skeleton -->
        <div v-if="isLoading" class="row g-4">
          <div v-for="n in 3" :key="n" class="col-12 col-md-6 col-lg-4">
            <div class="home-card rounded-4 p-4 h-100 placeholder-glow">
              <span class="placeholder col-4 rounded mb-3"></span>
              <h3 class="h5 placeholder col-9 rounded mb-2"></h3>
              <p class="placeholder col-12 rounded mb-1"></p>
              <p class="placeholder col-8 rounded mb-4"></p>
              <span class="placeholder col-5 rounded"></span>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="blogs.length === 0" class="home-empty rounded-4 p-5 text-center">
          <div class="home-empty__icon mx-auto mb-3">
            <i class="bi bi-journal-plus fs-4"></i>
          </div>
          <h3 class="h5 fw-bold mb-1">No articles published yet</h3>
          <p class="mb-3 home-muted">Be the first to share a story with the Blogy community.</p>
          <router-link to="/blogs" class="btn home-btn-primary rounded-pill px-4 py-2 fw-semibold">
            Go to Blogs
          </router-link>
        </div>

        <!-- Article Cards -->
        <div v-else class="row g-4">
          <div
            v-for="blog in (gridBlogs.length > 0 ? gridBlogs : blogs)"
            :key="blog._id"
            class="col-12 col-md-6 col-lg-4"
          >
            <article class="home-card rounded-4 p-4 h-100 d-flex flex-column">
              <div class="d-flex align-items-center justify-content-between gap-2 mb-3">
                <span class="home-card__tag rounded-pill px-2.5 py-1 fw-semibold">
                  {{ getReadingTime(blog.content) }}
                </span>
                <span v-if="formatDate(blog)" class="home-muted small">
                  {{ formatDate(blog) }}
                </span>
              </div>

              <h3 class="h5 fw-bold home-card__title mb-2">
                <router-link :to="`/blogs/${blog._id}`" class="home-title-link text-decoration-none">
                  {{ blog.title }}
                </router-link>
              </h3>

              <p class="home-card__excerpt mb-4 flex-grow-1">
                {{ getExcerpt(blog.content) }}
              </p>

              <div class="home-card__footer pt-3 d-flex align-items-center justify-content-between gap-2">
                <div class="d-flex align-items-center gap-2 min-w-0">
                  <span class="home-avatar home-avatar--sm">
                    {{ getAuthorLabel(blog).slice(0, 2).toUpperCase() }}
                  </span>
                  <span class="small text-truncate home-muted fw-medium">
                    {{ getAuthorLabel(blog) }}
                  </span>
                </div>

                <router-link
                  :to="`/blogs/${blog._id}`"
                  class="home-read-cta small fw-semibold text-decoration-none flex-shrink-0"
                >
                  Read <i class="bi bi-arrow-right"></i>
                </router-link>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>

    <!-- Two-Column FAQ Section -->
    <section class="home-faq py-5">
      <div class="container">
        <div class="row gy-4 align-items-start">
          <div class="col-12 col-lg-4">
            <span class="home-kicker text-uppercase fw-bold small">Help &amp; Info</span>
            <h2 class="home-heading h2 fw-bold mt-1 mb-3">Frequently Asked Questions</h2>
            <p class="home-faq__intro mb-4">
              Quick answers about publishing, commenting, and browsing stories on Blogy.
            </p>
            <router-link to="/blogs" class="btn home-btn-secondary rounded-pill px-4 py-2 small fw-semibold">
              Explore Community Feed
            </router-link>
          </div>

          <div class="col-12 col-lg-8">
            <div class="d-flex flex-column gap-3">
              <div
                v-for="(faq, index) in faqs"
                :key="index"
                class="home-faq-item rounded-4 overflow-hidden"
                :class="{ 'home-faq-item--open': activeFaq === index }"
              >
                <button
                  type="button"
                  class="home-faq-item__trigger w-100 text-start d-flex align-items-center justify-content-between gap-3"
                  :aria-expanded="activeFaq === index"
                  @click="toggleFaq(index)"
                >
                  <span class="fw-semibold">{{ faq.question }}</span>
                  <span class="home-faq-item__icon" aria-hidden="true">
                    {{ activeFaq === index ? '−' : '+' }}
                  </span>
                </button>

                <div v-if="activeFaq === index" class="home-faq-item__body">
                  {{ faq.answer }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Bottom CTA Banner (Logged Out Users) -->
    <section v-if="!isLoggedIn" class="home-cta pb-5">
      <div class="container">
        <div class="home-cta__card rounded-4 p-4 p-md-5 d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-4">
          <div>
            <span class="home-kicker text-uppercase fw-bold small">Join Blogy</span>
            <h2 class="h3 fw-bold mt-1 mb-2 home-heading">Have an idea worth sharing?</h2>
            <p class="home-cta__text mb-0">
              Create a free account to publish your own articles and join conversations across the community.
            </p>
          </div>

          <div class="d-flex flex-wrap gap-2 flex-shrink-0">
            <router-link to="/register" class="btn home-btn-primary rounded-pill px-4 py-2 fw-semibold">
              Create Free Account
            </router-link>
            <router-link to="/login" class="btn home-btn-secondary rounded-pill px-4 py-2 fw-semibold">
              Log In
            </router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  background-color: var(--bg-page);
  color: var(--text-primary);
}

/* Shared Typography & Helpers */
.home-eyebrow {
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

.home-eyebrow__dot {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 50%;
  background-color: var(--accent-primary);
}

.home-kicker {
  color: var(--accent-primary);
  letter-spacing: 0.06em;
}

.home-heading {
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.home-muted {
  color: var(--text-muted);
}

.home-title-link {
  color: var(--text-primary);
  transition: color 0.15s ease;
}

.home-title-link:hover {
  color: var(--accent-primary);
}

/* Buttons */
.home-btn-primary {
  background-color: var(--accent-primary);
  border: 1.5px solid var(--accent-primary);
  color: #ffffff;
  transition: background-color 0.15s ease, border-color 0.15s ease, transform 0.12s ease;
}

.home-btn-primary:hover {
  background-color: var(--accent-hover);
  border-color: var(--accent-hover);
  color: #ffffff;
}

.home-btn-secondary {
  background-color: var(--bg-surface);
  border: 1.5px solid var(--border-strong);
  color: var(--text-primary);
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.home-btn-secondary:hover {
  background-color: var(--accent-soft);
  border-color: var(--accent-primary);
  color: var(--accent-hover);
}

/* Hero */
.home-hero {
  border-bottom: 1px solid var(--border-light);
}

.home-hero__title {
  color: var(--text-primary);
  letter-spacing: -0.03em;
  line-height: 1.12;
}

.home-hero__subtitle {
  color: var(--text-secondary);
  line-height: 1.65;
  max-width: 58ch;
}

.home-trust-strip {
  border-top: 1px solid var(--border-light);
}

.home-trust-item {
  display: flex;
  flex-direction: column;
}

.home-trust-item__num {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.2;
}

.home-trust-item__label {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.home-trust-divider {
  width: 1px;
  height: 1.85rem;
  background-color: var(--border-light);
}

/* Spotlight Card */
.home-spotlight {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-light);
  box-shadow: 0 16px 36px -20px rgba(28, 25, 23, 0.22);
}

.home-spotlight__bar {
  height: 4px;
  background: linear-gradient(90deg, var(--accent-primary), var(--accent-hover));
}

.home-spotlight__pill {
  background-color: var(--accent-soft);
  color: var(--accent-hover);
  border-radius: 999px;
  padding: 0.3rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
}

.home-spotlight__title {
  line-height: 1.3;
  letter-spacing: -0.015em;
}

.home-spotlight__excerpt {
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.65;
}

.home-spotlight__footer {
  border-top: 1px solid var(--border-light);
}

.home-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: var(--accent-soft);
  color: var(--accent-hover);
  font-size: 0.72rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.home-avatar--sm {
  width: 1.65rem;
  height: 1.65rem;
  font-size: 0.65rem;
}

.home-author-name {
  color: var(--text-primary);
}

.home-micro-date {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.home-read-cta {
  color: var(--accent-primary);
  transition: color 0.15s ease;
}

.home-read-cta:hover {
  color: var(--accent-hover);
}

/* Pillars Strip */
.home-pillars {
  background-color: var(--bg-subtle);
  border-bottom: 1px solid var(--border-light);
}

.home-pillar {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-light);
  height: 100%;
}

.home-pillar__icon {
  width: 2.35rem;
  height: 2.35rem;
  background-color: var(--accent-soft);
  color: var(--accent-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.05rem;
}

.home-pillar__title {
  color: var(--text-primary);
}

.home-pillar__text {
  color: var(--text-secondary);
  line-height: 1.5;
}

/* Latest Articles Grid */
.home-view-all {
  color: var(--accent-primary);
  font-size: 0.925rem;
  transition: color 0.15s ease;
}

.home-view-all:hover {
  color: var(--accent-hover);
}

.home-card {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-light);
  box-shadow: 0 6px 18px -12px rgba(28, 25, 23, 0.14);
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}

.home-card:hover {
  transform: translateY(-3px);
  border-color: var(--border-strong);
  box-shadow: 0 14px 28px -16px rgba(28, 25, 23, 0.22);
}

.home-card__tag {
  background-color: var(--bg-subtle);
  color: var(--text-secondary);
  border: 1px solid var(--border-light);
  padding: 0.2rem 0.65rem;
  font-size: 0.75rem;
}

.home-card__title {
  line-height: 1.35;
}

.home-card__excerpt {
  color: var(--text-secondary);
  font-size: 0.935rem;
  line-height: 1.65;
}

.home-card__footer {
  border-top: 1px solid var(--border-light);
}

/* Empty State */
.home-empty {
  background-color: var(--bg-surface);
  border: 1px dashed var(--border-strong);
}

.home-empty__icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background-color: var(--accent-soft);
  color: var(--accent-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* FAQs */
.home-faq {
  border-top: 1px solid var(--border-light);
}

.home-faq__intro {
  color: var(--text-secondary);
  line-height: 1.65;
}

.home-faq-item {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-light);
  transition: border-color 0.15s ease;
}

.home-faq-item--open {
  border-color: var(--border-strong);
}

.home-faq-item__trigger {
  background: transparent;
  border: none;
  padding: 1.1rem 1.25rem;
  color: var(--text-primary);
  font-size: 0.975rem;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.home-faq-item--open .home-faq-item__trigger {
  background-color: var(--accent-soft);
  color: var(--accent-hover);
}

.home-faq-item__icon {
  width: 1.65rem;
  height: 1.65rem;
  border-radius: 50%;
  background-color: var(--bg-subtle);
  color: var(--text-secondary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}

.home-faq-item--open .home-faq-item__icon {
  background-color: var(--accent-primary);
  color: #ffffff;
}

.home-faq-item__body {
  padding: 1rem 1.25rem 1.15rem;
  color: var(--text-secondary);
  border-top: 1px solid var(--border-light);
  line-height: 1.65;
  font-size: 0.94rem;
}

/* Bottom CTA */
.home-cta__card {
  background: linear-gradient(135deg, var(--bg-surface) 0%, var(--accent-soft) 100%);
  border: 1px solid var(--border-strong);
}

.home-cta__text {
  color: var(--text-secondary);
  max-width: 540px;
}
</style>