<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import api from '../api.js';
import { useGlobalStore } from '../stores/global.js';

const router = useRouter();
const notyf = new Notyf();
const globalStore = useGlobalStore();

const blogs = ref([]);
const loading = ref(true);
const error = ref(null);
const submitting = ref(false);
const searchQuery = ref('');

// Create Post Modal
const showModal = ref(false);
const form = ref({
  title: '',
  content: ''
});

// 3-Dot Menu & Edit Post Modal
const openMenuId = ref(null);
const showEditModal = ref(false);
const isUpdating = ref(false);
const editingBlogId = ref(null);
const editForm = ref({
  title: '',
  content: ''
});

// Delete Post Modal
const showDeleteModal = ref(false);
const isDeleting = ref(false);
const deletingBlog = ref(null);

const isAuthenticated = computed(() => Boolean(globalStore.user?.token || globalStore.user?.id));

const ctaLabel = computed(() => (isAuthenticated.value ? 'New Post' : 'Log in to Post'));

const isBlogAuthor = (blog) => {
  if (!globalStore.user?.id) return false;
  if (!blog?.author) return false;
  return String(blog.author) === String(globalStore.user.id);
};

const getAuthorDisplay = (blog) => {
  return blog?.author ? String(blog.author) : 'Unknown';
};

const filteredBlogs = computed(() => {
  const q = searchQuery.value.toLowerCase();
  if (!q) return blogs.value;

  return blogs.value.filter((blog) => {
    const title = String(blog.title ?? '').toLowerCase();
    const content = String(blog.content ?? '').toLowerCase();
    const author = getAuthorDisplay(blog).toLowerCase();
    return title.includes(q) || content.includes(q) || author.includes(q);
  });
});

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return String(dateStr);
  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const toggleMenu = (blogId) => {
  openMenuId.value = openMenuId.value === blogId ? null : blogId;
};

const closeMenus = () => {
  openMenuId.value = null;
};

const closeDeleteModal = () => {
  if (!isDeleting.value) {
    showDeleteModal.value = false;
    deletingBlog.value = null;
  }
};

const handleKeydown = (e) => {
  if (e.key === 'Escape') {
    closeMenus();
    if (!submitting.value) showModal.value = false;
    if (!isUpdating.value) showEditModal.value = false;
    closeDeleteModal();
  }
};

const fetchBlogs = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await api.get('/blogs/getBlogs');
    const data = res.data;
    blogs.value = Array.isArray(data) ? data : (data?.blogs ?? []);
  } catch (err) {
    error.value = err.response?.data?.message ?? err.message;
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  form.value = { title: '', content: '' };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const handleCtaClick = () => {
  if (!isAuthenticated.value) {
    router.push('/login');
    return;
  }
  openCreateModal();
};

const addBlog = async () => {
  submitting.value = true;
  try {
    const res = await api.post('/blogs/addBlogs', {
      title: form.value.title.trim(),
      content: form.value.content.trim()
    });

    if (res.data?.message && res.status >= 400) {
      throw new Error(res.data.message);
    }

    notyf.success('Blog post published');
    closeModal();
    await fetchBlogs();
  } catch (err) {
    notyf.error(err.response?.data?.message ?? err.message);
  } finally {
    submitting.value = false;
  }
};

const openEditModal = (blog) => {
  closeMenus();
  editingBlogId.value = blog._id;
  editForm.value = {
    title: blog.title ?? '',
    content: blog.content ?? ''
  };
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  editingBlogId.value = null;
};

const handleUpdateBlog = async () => {
  if (!editingBlogId.value) return;
  isUpdating.value = true;
  try {
    const payload = {
      title: editForm.value.title.trim(),
      content: editForm.value.content.trim()
    };
    const { data } = await api.patch(`/blogs/update/${editingBlogId.value}`, payload);
    const updated = data?.blog ?? data;

    blogs.value = blogs.value.map((item) => {
      if (item._id !== editingBlogId.value) return item;
      return {
        ...item,
        title: updated?.title ?? payload.title,
        content: updated?.content ?? payload.content
      };
    });

    notyf.success('Blog post updated');
    closeEditModal();
  } catch (err) {
    notyf.error(err.response?.data?.message ?? 'Failed to update blog post');
  } finally {
    isUpdating.value = false;
  }
};

const openDeleteModal = (blog) => {
  closeMenus();
  deletingBlog.value = blog;
  showDeleteModal.value = true;
};

const handleDeleteBlog = async () => {
  if (!deletingBlog.value) return;
  isDeleting.value = true;
  try {
    const targetId = deletingBlog.value._id;
    await api.delete(`/blogs/delete/${targetId}`);
    blogs.value = blogs.value.filter((item) => item._id !== targetId);
    notyf.success('Blog post deleted');
    showDeleteModal.value = false;
    deletingBlog.value = null;
  } catch (err) {
    notyf.error(err.response?.data?.message ?? 'Failed to delete blog post');
  } finally {
    isDeleting.value = false;
  }
};

onMounted(() => {
  fetchBlogs();
  window.addEventListener('click', closeMenus);
  window.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('click', closeMenus);
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <div class="blog-page">
    <div class="blog-wrapper">
      <!-- Top Editorial Header -->
      <header class="blog-top">
        <div class="blog-top__copy">
          <div class="blog-eyebrow">
            <span class="blog-eyebrow__dot"></span>
            <span>Community Journal</span>
          </div>
          <h1 class="blog-heading">Stories &amp; Notes</h1>
          <p class="blog-lead">Thoughts, project logs, and ideas shared across the community.</p>
        </div>

        <button
          type="button"
          class="blog-btn blog-btn--primary"
          @click="handleCtaClick"
        >
          <span v-if="isAuthenticated" class="blog-btn__plus" aria-hidden="true">+</span>
          <span>{{ ctaLabel }}</span>
        </button>
      </header>

      <!-- Search & Counter Bar -->
      <div class="blog-toolbar">
        <div class="blog-search">
          <span class="blog-search__icon" aria-hidden="true">⌕</span>
          <input
            v-model.trim="searchQuery"
            type="search"
            class="blog-search__input"
            placeholder="Search by title, content, or author..."
            aria-label="Search blog posts"
          />
          <button
            v-if="searchQuery"
            type="button"
            class="blog-search__clear"
            aria-label="Clear search"
            @click="searchQuery = ''"
          >
            Clear
          </button>
        </div>

        <div v-if="!loading && !error" class="blog-count-pill">
          {{ filteredBlogs.length }} {{ filteredBlogs.length === 1 ? 'story' : 'stories' }}
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="blog-status-box">
        <div class="blog-spinner" role="status" aria-label="Loading blogs"></div>
        <p class="blog-status-box__text">Loading community stories...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="blog-error" role="alert">
        {{ error }}
      </div>

      <!-- Empty (No Posts) -->
      <div v-else-if="blogs.length === 0" class="blog-status-box">
        <div class="blog-status-box__icon">✦</div>
        <h2 class="blog-status-box__title">No stories published yet</h2>
        <p class="blog-status-box__text">Start the feed by publishing the first post.</p>
        <button
          type="button"
          class="blog-btn blog-btn--primary blog-status-box__btn"
          @click="handleCtaClick"
        >
          {{ isAuthenticated ? 'Write First Post' : ctaLabel }}
        </button>
      </div>

      <!-- Empty (No Search Matches) -->
      <div v-else-if="filteredBlogs.length === 0" class="blog-status-box">
        <div class="blog-status-box__icon">⌕</div>
        <h2 class="blog-status-box__title">No matching stories</h2>
        <p class="blog-status-box__text">
          Nothing matched "<strong>{{ searchQuery }}</strong>".
        </p>
        <button
          type="button"
          class="blog-btn blog-btn--secondary blog-status-box__btn"
          @click="searchQuery = ''"
        >
          Reset Filter
        </button>
      </div>

      <!-- Blog Cards -->
      <div v-else class="blog-list">
        <article
          v-for="blog in filteredBlogs"
          :key="blog._id"
          class="blog-item"
        >
          <div class="blog-item__header">
            <div class="blog-item__meta">
              <span class="blog-item__avatar" aria-hidden="true">
                {{ getAuthorDisplay(blog).slice(0, 2).toUpperCase() }}
              </span>
              <span class="blog-item__author" :title="getAuthorDisplay(blog)">
                {{ getAuthorDisplay(blog) }}
              </span>
              <span class="blog-item__sep">·</span>
              <span class="blog-item__date">
                {{ formatDate(blog.createdDate || blog.createDate || blog.createdAt) }}
              </span>
            </div>

            <!-- 3-Dot Menu (Author Only) -->
            <div
              v-if="isBlogAuthor(blog)"
              class="blog-menu"
              @click.stop
            >
              <button
                type="button"
                class="blog-menu__trigger"
                aria-label="Post options"
                :aria-expanded="openMenuId === blog._id"
                @click="toggleMenu(blog._id)"
              >
                ⋮
              </button>

              <div
                v-if="openMenuId === blog._id"
                class="blog-menu__dropdown"
                role="menu"
              >
                <button
                  type="button"
                  class="blog-menu__item"
                  role="menuitem"
                  @click="openEditModal(blog)"
                >
                  Edit Post
                </button>
                <button
                  type="button"
                  class="blog-menu__item blog-menu__item--danger"
                  role="menuitem"
                  @click="openDeleteModal(blog)"
                >
                  Delete Post
                </button>
              </div>
            </div>
          </div>

          <h2 class="blog-item__title">
            <router-link :to="`/blogs/${blog._id}`" class="blog-item__title-link">
              {{ blog.title }}
            </router-link>
          </h2>

          <p class="blog-item__content">
            {{ blog.content }}
          </p>

          <div class="blog-item__footer">
            <router-link :to="`/blogs/${blog._id}`" class="blog-link">
              <span>Read full story</span>
              <span class="blog-link__arrow" aria-hidden="true">→</span>
            </router-link>
          </div>
        </article>
      </div>
    </div>

    <!-- Create Post Modal -->
    <div
      v-if="showModal"
      class="blog-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Add a Blog Post"
      @click.self="closeModal"
    >
      <div class="blog-modal">
        <form @submit.prevent="addBlog">
          <div class="blog-modal__head">
            <div>
              <span class="blog-modal__kicker">Publish</span>
              <h2 class="blog-modal__title">New Blog Post</h2>
            </div>
            <button
              type="button"
              class="blog-modal__close"
              aria-label="Close"
              @click="closeModal"
            >
              ×
            </button>
          </div>

          <div class="blog-modal__body">
            <div class="blog-field">
              <label for="userBlogTitleInput" class="blog-label">Title</label>
              <input
                id="userBlogTitleInput"
                v-model="form.title"
                type="text"
                class="blog-input"
                required
                placeholder="Give your story a clear title"
              />
            </div>

            <div class="blog-field">
              <label for="userBlogContentInput" class="blog-label">Content</label>
              <textarea
                id="userBlogContentInput"
                v-model="form.content"
                class="blog-textarea"
                rows="6"
                required
                placeholder="Write your thoughts, notes, or update..."
              ></textarea>
            </div>
          </div>

          <div class="blog-modal__foot">
            <button
              type="button"
              class="blog-btn blog-btn--secondary"
              @click="closeModal"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="blog-btn blog-btn--primary"
              :disabled="submitting"
            >
              {{ submitting ? 'Publishing...' : 'Publish Post' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Post Modal (Author Only) -->
    <div
      v-if="showEditModal"
      class="blog-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Edit Blog Post"
      @click.self="closeEditModal"
    >
      <div class="blog-modal">
        <form @submit.prevent="handleUpdateBlog">
          <div class="blog-modal__head">
            <div>
              <span class="blog-modal__kicker">Update</span>
              <h2 class="blog-modal__title">Edit Blog Post</h2>
            </div>
            <button
              type="button"
              class="blog-modal__close"
              aria-label="Close"
              @click="closeEditModal"
            >
              ×
            </button>
          </div>

          <div class="blog-modal__body">
            <div class="blog-field">
              <label for="editBlogTitleInput" class="blog-label">Title</label>
              <input
                id="editBlogTitleInput"
                v-model="editForm.title"
                type="text"
                class="blog-input"
                required
              />
            </div>

            <div class="blog-field">
              <label for="editBlogContentInput" class="blog-label">Content</label>
              <textarea
                id="editBlogContentInput"
                v-model="editForm.content"
                class="blog-textarea"
                rows="6"
                required
              ></textarea>
            </div>
          </div>

          <div class="blog-modal__foot">
            <button
              type="button"
              class="blog-btn blog-btn--secondary"
              @click="closeEditModal"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="blog-btn blog-btn--primary"
              :disabled="isUpdating"
            >
              {{ isUpdating ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Post Confirmation Modal (Author Only) -->
    <div
      v-if="showDeleteModal"
      class="blog-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Delete Blog Post"
      @click.self="closeDeleteModal"
    >
      <div class="blog-modal">
        <div class="blog-modal__head">
          <div>
            <span class="blog-modal__kicker blog-modal__kicker--danger">Confirm Removal</span>
            <h2 class="blog-modal__title">Delete Blog Post</h2>
          </div>
          <button
            type="button"
            class="blog-modal__close"
            aria-label="Close"
            :disabled="isDeleting"
            @click="closeDeleteModal"
          >
            ×
          </button>
        </div>

        <div class="blog-modal__body">
          <p class="blog-delete-lead">
            Are you sure you want to delete this post?
          </p>
          <p class="blog-delete-sub">
            “<strong>{{ deletingBlog?.title }}</strong>” will be permanently removed. This action cannot be undone.
          </p>
        </div>

        <div class="blog-modal__foot">
          <button
            type="button"
            class="blog-btn blog-btn--secondary"
            :disabled="isDeleting"
            @click="closeDeleteModal"
          >
            Cancel
          </button>
          <button
            type="button"
            class="blog-btn blog-btn--danger"
            :disabled="isDeleting"
            @click="handleDeleteBlog"
          >
            {{ isDeleting ? 'Deleting...' : 'Delete Post' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.blog-page {
  min-height: 100vh;
  background-color: var(--bg-page);
  color: var(--text-primary);
  padding: 2.75rem 1.25rem 4.5rem;
}

.blog-wrapper {
  max-width: 90%;
  margin: 0 auto;
}

.blog-top {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1.25rem;
  padding-bottom: 1.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-light);
}

.blog-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--accent-primary);
  margin-bottom: 0.45rem;
}

.blog-eyebrow__dot {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 50%;
  background-color: var(--accent-primary);
}

.blog-heading {
  margin: 0 0 0.3rem;
  font-size: 2.2rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.15;
  color: var(--text-primary);
}

.blog-lead {
  margin: 0;
  font-size: 0.975rem;
  color: var(--text-secondary);
}

/* Toolbar & Search */
.blog-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1.75rem;
}

.blog-search {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1 1 300px;
}

.blog-search__icon {
  position: absolute;
  left: 0.9rem;
  font-size: 1.1rem;
  color: var(--text-muted);
  pointer-events: none;
}

.blog-search__input {
  width: 100%;
  box-sizing: border-box;
  background-color: var(--bg-surface);
  color: var(--text-primary);
  border: 1px solid var(--border-strong);
  border-radius: 999px;
  padding: 0.65rem 4.4rem 0.65rem 2.4rem;
  font-size: 0.9rem;
  font-family: inherit;
  box-shadow: 0 2px 8px -4px rgba(28, 25, 23, 0.1);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.blog-search__input::placeholder {
  color: var(--text-muted);
}

.blog-search__input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.blog-search__clear {
  position: absolute;
  right: 0.5rem;
  background-color: var(--bg-subtle);
  color: var(--text-secondary);
  border: 1px solid var(--border-light);
  border-radius: 999px;
  padding: 0.25rem 0.65rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.blog-search__clear:hover {
  background-color: var(--border-light);
  color: var(--text-primary);
}

.blog-count-pill {
  background-color: var(--bg-surface);
  color: var(--text-secondary);
  border: 1px solid var(--border-light);
  border-radius: 999px;
  padding: 0.4rem 0.85rem;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
}

/* Blog Feed Cards */
.blog-list {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}

.blog-item {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: 16px;
  padding: 1.5rem 1.6rem;
  box-shadow: 0 4px 16px -10px rgba(28, 25, 23, 0.12);
  transition: transform 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease;
}

.blog-item:hover {
  transform: translateY(-2px);
  border-color: var(--border-strong);
  box-shadow: 0 14px 26px -14px rgba(28, 25, 23, 0.2);
}

.blog-item__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.85rem;
}

.blog-item__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.45rem;
  min-width: 0;
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.blog-item__avatar {
  width: 1.65rem;
  height: 1.65rem;
  border-radius: 50%;
  background-color: var(--accent-soft);
  color: var(--accent-hover);
  font-size: 0.6875rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.blog-item__author {
  font-weight: 600;
  color: var(--text-secondary);
  max-width: 165px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.blog-item__sep {
  opacity: 0.5;
}

.blog-item__date {
  font-weight: 500;
  color: var(--text-muted);
  white-space: nowrap;
}

/* 3-Dot Menu */
.blog-menu {
  position: relative;
  flex-shrink: 0;
}

.blog-menu__trigger {
  width: 2rem;
  height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  color: var(--text-muted);
  border: 1px solid transparent;
  border-radius: 8px;
  font-size: 1.15rem;
  line-height: 1;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.blog-menu__trigger:hover,
.blog-menu__trigger[aria-expanded='true'] {
  background-color: var(--bg-subtle);
  border-color: var(--border-light);
  color: var(--text-primary);
}

.blog-menu__dropdown {
  position: absolute;
  top: calc(100% + 0.35rem);
  right: 0;
  z-index: 30;
  min-width: 145px;
  background-color: var(--bg-surface);
  border: 1px solid var(--border-strong);
  border-radius: 12px;
  box-shadow: 0 14px 28px -10px rgba(28, 25, 23, 0.22);
  padding: 0.35rem;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.blog-menu__item {
  width: 100%;
  text-align: left;
  background: transparent;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.blog-menu__item:hover {
  background-color: var(--bg-subtle);
}

.blog-menu__item--danger {
  color: var(--status-danger);
}

.blog-menu__item--danger:hover {
  background-color: color-mix(in srgb, var(--status-danger) 10%, transparent);
  color: var(--status-danger);
}

.blog-item__title {
  margin: 0 0 0.6rem;
  font-size: 1.35rem;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.015em;
}

.blog-item__title-link {
  color: var(--text-primary);
  text-decoration: none;
  transition: color 0.15s ease;
}

.blog-item__title-link:hover {
  color: var(--accent-primary);
}

.blog-item__content {
  margin: 0 0 1.25rem;
  font-size: 0.9625rem;
  line-height: 1.7;
  color: var(--text-secondary);
  white-space: pre-line;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.blog-item__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.95rem;
  border-top: 1px solid var(--border-light);
}

.blog-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--accent-primary);
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  padding: 0.25rem 0.45rem;
  margin-left: -0.45rem;
  border-radius: 8px;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.blog-link__arrow {
  transition: transform 0.15s ease;
}

.blog-link:hover {
  background-color: var(--accent-soft);
  color: var(--accent-hover);
}

.blog-link:hover .blog-link__arrow {
  transform: translateX(3px);
}

/* Buttons */
.blog-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, transform 0.12s ease;
}

.blog-btn__plus {
  font-size: 1.05rem;
  line-height: 1;
}

.blog-btn--primary {
  background-color: var(--accent-primary);
  color: #ffffff;
  border: 1px solid var(--accent-primary);
  padding: 0.6rem 1.1rem;
  font-size: 0.875rem;
}

.blog-btn--primary:hover:not(:disabled) {
  background-color: var(--accent-hover);
  border-color: var(--accent-hover);
}

.blog-btn--primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.blog-btn--secondary {
  background-color: var(--bg-surface);
  color: var(--text-secondary);
  border: 1px solid var(--border-strong);
  padding: 0.55rem 1rem;
  font-size: 0.875rem;
}

.blog-btn--secondary:hover:not(:disabled) {
  background-color: var(--bg-subtle);
  color: var(--text-primary);
}

.blog-btn--danger {
  background-color: var(--status-danger);
  color: #ffffff;
  border: 1px solid var(--status-danger);
  padding: 0.55rem 1rem;
  font-size: 0.875rem;
}

.blog-btn--danger:hover:not(:disabled) {
  opacity: 0.9;
  color: #ffffff;
}

.blog-btn--danger:disabled,
.blog-btn--secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Status & Empty States */
.blog-status-box {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: 16px;
  padding: 3.25rem 1.5rem;
  text-align: center;
}

.blog-status-box__icon {
  width: 2.5rem;
  height: 2.5rem;
  margin: 0 auto 0.85rem;
  border-radius: 50%;
  background-color: var(--accent-soft);
  color: var(--accent-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 700;
}

.blog-status-box__title {
  margin: 0 0 0.35rem;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
}

.blog-status-box__text {
  margin: 0;
  font-size: 0.925rem;
  color: var(--text-muted);
}

.blog-status-box__btn {
  margin-top: 1.15rem;
}

.blog-error {
  background-color: var(--bg-surface);
  color: var(--status-danger);
  border: 1px solid var(--border-strong);
  border-left: 4px solid var(--status-danger);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  font-size: 0.925rem;
}

.blog-spinner {
  width: 1.9rem;
  height: 1.9rem;
  margin: 0 auto 0.75rem;
  border: 3px solid var(--accent-soft);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: blog-spin 0.75s linear infinite;
}

@keyframes blog-spin {
  to {
    transform: rotate(360deg);
  }
}

/* Modals */
.blog-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1050;
  background-color: rgba(28, 25, 23, 0.52);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.blog-modal {
  width: 100%;
  max-width: 540px;
  background-color: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: 16px;
  box-shadow: 0 24px 48px -14px rgba(28, 25, 23, 0.28);
  overflow: hidden;
}

.blog-modal__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.15rem 1.45rem;
  background-color: var(--bg-subtle);
  border-bottom: 1px solid var(--border-light);
}

.blog-modal__kicker {
  display: block;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--accent-primary);
  margin-bottom: 0.15rem;
}

.blog-modal__kicker--danger {
  color: var(--status-danger);
}

.blog-modal__title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
}

.blog-modal__close {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0 0.25rem;
  transition: color 0.15s ease;
}

.blog-modal__close:hover:not(:disabled) {
  color: var(--text-primary);
}

.blog-modal__body {
  padding: 1.45rem;
}

.blog-delete-lead {
  margin: 0 0 0.45rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.blog-delete-sub {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--text-muted);
}

.blog-field {
  margin-bottom: 1.05rem;
}

.blog-field:last-child {
  margin-bottom: 0;
}

.blog-label {
  display: block;
  margin-bottom: 0.4rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.blog-input,
.blog-textarea {
  width: 100%;
  box-sizing: border-box;
  background-color: var(--bg-page);
  color: var(--text-primary);
  border: 1px solid var(--border-strong);
  border-radius: 10px;
  padding: 0.65rem 0.8rem;
  font-size: 0.95rem;
  font-family: inherit;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;
}

.blog-input:focus,
.blog-textarea:focus {
  outline: none;
  background-color: var(--bg-surface);
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.blog-textarea {
  resize: vertical;
  min-height: 130px;
}

.blog-modal__foot {
  display: flex;
  justify-content: flex-end;
  gap: 0.65rem;
  padding: 1rem 1.45rem;
  background-color: var(--bg-subtle);
  border-top: 1px solid var(--border-light);
}
</style>