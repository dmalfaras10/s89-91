<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import api from '../api.js';
import { useGlobalStore } from '../stores/global.js';

const store = useGlobalStore();

const blogs = ref([]);
const loading = ref(true);
const error = ref(null);
const searchQuery = ref('');

// Delete Modal State
const showDeleteModal = ref(false);
const deletingBlog = ref(null);
const isDeleting = ref(false);
const deleteError = ref('');

const getAuthorDisplay = (blog) => {
  if (!blog.author) return 'Unknown';
  return String(blog.author);
};

const filteredBlogs = computed(() => {
  const q = searchQuery.value.toLowerCase();
  if (!q) return blogs.value;

  return blogs.value.filter((blog) => {
    const title = String(blog.title).toLowerCase();
    const content = String(blog.content).toLowerCase();
    const author = String(blog.author).toLowerCase();
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

const fetchBlogs = async () => {
  loading.value = true;
  error.value = null;
  try {
    const { data } = await api.get('/blogs/getBlogs');

    if (Array.isArray(data)) {
      blogs.value = data;
    } else if (Array.isArray(data.blogs)) {
      blogs.value = data.blogs;
    } else {
      blogs.value = [];
    }
  } catch (err) {
    error.value = err.response?.data?.message || err.message;
  } finally {
    loading.value = false;
  }
};

const openDeleteModal = (blog) => {
  deletingBlog.value = blog;
  deleteError.value = '';
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  if (isDeleting.value) return;
  showDeleteModal.value = false;
  deletingBlog.value = null;
  deleteError.value = '';
};

const confirmDeleteBlog = async () => {
  if (!deletingBlog.value) return;

  isDeleting.value = true;
  deleteError.value = '';
  try {
    const targetId = deletingBlog.value._id;
    await api.delete(`/blogs/delete/${targetId}`);
    blogs.value = blogs.value.filter((b) => b._id !== targetId);
    showDeleteModal.value = false;
    deletingBlog.value = null;
  } catch (err) {
    deleteError.value = err.response?.data?.message || err.message || 'Failed to delete post.';
  } finally {
    isDeleting.value = false;
  }
};

const handleKeydown = (e) => {
  if (e.key === 'Escape' && showDeleteModal.value) {
    closeDeleteModal();
  }
};

onMounted(() => {
  void store.user;
  fetchBlogs();
  window.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <div class="blog-page">
    <div class="blog-wrapper">
      <!-- Admin Header -->
      <header class="blog-top">
        <div>
          <span class="blog-badge blog-badge--admin">Admin Moderation</span>
          <h1 class="blog-heading">Blog Management</h1>
          <p class="blog-lead">Admin can only delete the post.</p>
        </div>
      </header>

      <!-- Admin Summary Strip -->
      <div v-if="!loading && !error" class="blog-admin-stats">
        <div class="blog-admin-stat">
          <span class="blog-admin-stat__label">Total Posts</span>
          <strong class="blog-admin-stat__value">{{ blogs.length }}</strong>
        </div>
        <div class="blog-admin-stat">
          <span class="blog-admin-stat__label">Showing</span>
          <strong class="blog-admin-stat__value">{{ filteredBlogs.length }}</strong>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="blog-search">
        <div class="blog-search__field">
          <span class="blog-search__icon" aria-hidden="true">⌕</span>
          <input
            v-model.trim="searchQuery"
            type="search"
            class="blog-search__input"
            placeholder="Search posts by title, content, or author..."
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
        <span v-if="!loading && !error" class="blog-search__count">
          {{ filteredBlogs.length }} {{ filteredBlogs.length === 1 ? 'post' : 'posts' }}
        </span>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="blog-status-box">
        <div class="blog-spinner" role="status" aria-label="Loading blogs"></div>
        <p class="blog-status-box__text">Fetching blog posts...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="blog-error" role="alert">
        {{ error }}
      </div>

      <!-- Empty (No Posts at All) -->
      <div v-else-if="blogs.length === 0" class="blog-status-box">
        <h2 class="blog-status-box__title">Nothing published yet</h2>
        <p class="blog-status-box__text">There are currently no blog posts available.</p>
      </div>

      <!-- Empty (No Search Matches) -->
      <div v-else-if="filteredBlogs.length === 0" class="blog-status-box">
        <h2 class="blog-status-box__title">No matching posts</h2>
        <p class="blog-status-box__text">
          No posts matched "{{ searchQuery }}".
        </p>
        <button
          type="button"
          class="blog-btn blog-btn--secondary blog-status-box__btn"
          @click="searchQuery = ''"
        >
          Reset Search
        </button>
      </div>

      <!-- Table List -->
      <div v-else class="blog-table-wrap">
        <table class="blog-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Content</th>
              <th>Created Date</th>
              <th class="blog-table__th-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="blog in filteredBlogs"
              :key="blog._id"
              class="blog-table__row"
            >
              <td class="blog-table__title-cell">
                <router-link
                  :to="`/blogs/${blog._id}`"
                  class="blog-table__title-link"
                >
                  {{ blog.title }}
                </router-link>
              </td>
              <td class="blog-table__author-cell">
                {{ getAuthorDisplay(blog) }}
              </td>
              <td class="blog-table__content-cell">
                <p class="blog-table__excerpt">{{ blog.content }}</p>
              </td>
              <td class="blog-table__date-cell">
                {{ formatDate(blog.createdDate) }}
              </td>
              <td class="blog-table__actions-cell">
                <div class="blog-table__action-btns">
                  <button
                    type="button"
                    class="blog-btn blog-btn--danger blog-btn--sm"
                    @click="openDeleteModal(blog)"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="blog-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="blogDeleteModalTitle"
      @click.self="closeDeleteModal"
    >
      <div class="blog-modal">
        <div class="blog-modal__head">
          <h2 id="blogDeleteModalTitle" class="blog-modal__title">Delete Post</h2>
          <button
            type="button"
            class="blog-modal__close"
            aria-label="Close modal"
            :disabled="isDeleting"
            @click="closeDeleteModal"
          >
            ×
          </button>
        </div>

        <div class="blog-modal__body">
          <p class="blog-modal__text">
            Are you sure you want to delete <strong>"{{ deletingBlog?.title }}"</strong>? This action cannot be undone.
          </p>
          <p v-if="deleteError" class="blog-modal__error" role="alert">
            {{ deleteError }}
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
            class="blog-btn blog-btn--danger blog-btn--solid"
            :disabled="isDeleting"
            @click="confirmDeleteBlog"
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
  padding: 3rem 1.25rem 4rem;
}

.blog-wrapper {
  max-width: 1080px;
  margin: 0 auto;
}

.blog-top {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
  padding-bottom: 1.5rem;
  margin-bottom: 1.25rem;
  border-bottom: 1px solid var(--border-light);
}

.blog-badge {
  display: inline-block;
  background-color: var(--bg-subtle);
  color: var(--text-secondary);
  border: 1px solid var(--border-light);
  border-radius: 6px;
  padding: 0.2rem 0.55rem;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.blog-badge--admin {
  background-color: var(--accent-soft);
  color: var(--accent-hover);
  border-color: transparent;
}

.blog-heading {
  margin: 0 0 0.35rem;
  font-size: 2.125rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: var(--text-primary);
}

.blog-lead {
  margin: 0;
  font-size: 0.975rem;
  color: var(--text-secondary);
}

.blog-admin-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.blog-admin-stat {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: 10px;
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.blog-admin-stat__label {
  font-size: 0.8125rem;
  color: var(--text-muted);
  font-weight: 500;
}

.blog-admin-stat__value {
  font-size: 1.05rem;
  color: var(--text-primary);
}

.blog-search {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.blog-search__field {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1 1 280px;
}

.blog-search__icon {
  position: absolute;
  left: 0.85rem;
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
  border-radius: 10px;
  padding: 0.65rem 4.25rem 0.65rem 2.35rem;
  font-size: 0.925rem;
  font-family: inherit;
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
  border-radius: 6px;
  padding: 0.22rem 0.55rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.blog-search__clear:hover {
  background-color: var(--border-light);
  color: var(--text-primary);
}

.blog-search__count {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-muted);
  white-space: nowrap;
}

/* Table List */
.blog-table-wrap {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  overflow-x: auto;
  box-shadow: 0 6px 18px -14px rgba(28, 25, 23, 0.18);
}

.blog-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  min-width: 740px;
}

.blog-table thead {
  background-color: var(--bg-subtle);
  border-bottom: 1px solid var(--border-light);
}

.blog-table th {
  padding: 0.85rem 1rem;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  white-space: nowrap;
}

.blog-table__th-actions {
  text-align: right;
}

.blog-table__row {
  border-bottom: 1px solid var(--border-light);
  transition: background-color 0.15s ease;
}

.blog-table__row:last-child {
  border-bottom: none;
}

.blog-table__row:hover {
  background-color: var(--bg-page);
}

.blog-table td {
  padding: 0.95rem 1rem;
  vertical-align: top;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.blog-table__title-cell {
  max-width: 230px;
}

.blog-table__title-link {
  color: var(--text-primary);
  font-weight: 700;
  font-size: 0.95rem;
  text-decoration: none;
  line-height: 1.35;
}

.blog-table__title-link:hover {
  color: var(--accent-primary);
  text-decoration: underline;
}

.blog-table__author-cell {
  max-width: 170px;
  word-break: break-word;
  font-size: 0.84rem;
}

.blog-table__content-cell {
  max-width: 320px;
}

.blog-table__excerpt {
  margin: 0;
  line-height: 1.55;
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.blog-table__date-cell {
  white-space: nowrap;
  font-size: 0.84rem;
  color: var(--text-muted);
}

.blog-table__actions-cell {
  text-align: right;
  white-space: nowrap;
}

.blog-table__action-btns {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.blog-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.blog-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.blog-btn--secondary {
  background-color: var(--bg-surface);
  color: var(--text-secondary);
  border: 1px solid var(--border-strong);
  padding: 0.5rem 0.9rem;
  font-size: 0.875rem;
}

.blog-btn--secondary:hover:not(:disabled) {
  background-color: var(--bg-subtle);
  color: var(--text-primary);
}

.blog-btn--danger {
  background-color: var(--bg-surface);
  color: var(--status-danger);
  border: 1px solid var(--border-strong);
  padding: 0.5rem 0.9rem;
  font-size: 0.875rem;
}

.blog-btn--danger:hover:not(:disabled) {
  background-color: var(--status-danger);
  border-color: var(--status-danger);
  color: #ffffff;
}

.blog-btn--solid {
  background-color: var(--status-danger);
  border-color: var(--status-danger);
  color: #ffffff;
}

.blog-btn--solid:hover:not(:disabled) {
  opacity: 0.9;
}

.blog-btn--sm {
  padding: 0.32rem 0.7rem;
  font-size: 0.8125rem;
  border-radius: 6px;
}

.blog-status-box {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 3rem 1.5rem;
  text-align: center;
}

.blog-status-box__title {
  margin: 0 0 0.35rem;
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text-primary);
}

.blog-status-box__text {
  margin: 0;
  font-size: 0.925rem;
  color: var(--text-muted);
}

.blog-status-box__btn {
  margin-top: 1rem;
}

.blog-error {
  background-color: var(--bg-surface);
  color: var(--status-danger);
  border: 1px solid var(--border-strong);
  border-left: 4px solid var(--status-danger);
  border-radius: 10px;
  padding: 1rem 1.25rem;
  font-size: 0.925rem;
}

.blog-spinner {
  width: 1.85rem;
  height: 1.85rem;
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

/* Delete Modal */
.blog-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1050;
  background-color: rgba(28, 25, 23, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.blog-modal {
  width: 100%;
  max-width: 440px;
  background-color: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  box-shadow: 0 20px 40px -15px rgba(28, 25, 23, 0.3);
  overflow: hidden;
}

.blog-modal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background-color: var(--bg-subtle);
  border-bottom: 1px solid var(--border-light);
}

.blog-modal__title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
}

.blog-modal__close {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 1.35rem;
  line-height: 1;
  cursor: pointer;
  padding: 0 0.25rem;
  transition: color 0.15s ease;
}

.blog-modal__close:hover:not(:disabled) {
  color: var(--text-primary);
}

.blog-modal__close:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.blog-modal__body {
  padding: 1.25rem;
}

.blog-modal__text {
  margin: 0;
  font-size: 0.925rem;
  line-height: 1.6;
  color: var(--text-secondary);
}

.blog-modal__error {
  margin: 0.75rem 0 0;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--status-danger);
}

.blog-modal__foot {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  padding: 0.9rem 1.25rem;
  background-color: var(--bg-subtle);
  border-top: 1px solid var(--border-light);
}
</style>