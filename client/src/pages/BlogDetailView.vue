<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Notyf } from 'notyf';
import api from '../api.js';
import { useGlobalStore } from '../stores/global.js';

const route = useRoute();
const router = useRouter();
const notyf = new Notyf();
const { user } = useGlobalStore();

const blog = ref(null);
const comments = ref([]);
const newComment = ref('');
const isLoading = ref(true);
const isSubmittingComment = ref(false);

const menuOpen = ref(false);
const showEditModal = ref(false);
const isUpdatingBlog = ref(false);
const editForm = ref({ title: '', content: '' });

const showDeleteModal = ref(false);
const isDeletingBlog = ref(false);

const blogId = route.params.blogId;

const isLoggedIn = computed(() => Boolean(user?.token || user?.id));

const isBlogAuthor = computed(() => {
    if (!user?.id) return false;
    if (!blog.value?.author) return false;
    return String(blog.value.author) === String(user.id);
});

const readingTime = computed(() => {
    const words = (blog.value?.content ?? '').trim().split(/\s+/).filter(Boolean).length;
    const mins = Math.max(1, Math.ceil(words / 200));
    return `${mins} min read`;
});

function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return Number.isNaN(d.getTime())
        ? String(dateStr)
        : d.toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
          });
}

function toggleMenu() {
    menuOpen.value = !menuOpen.value;
}

function closeMenu() {
    menuOpen.value = false;
}

function openEditModal() {
    closeMenu();
    editForm.value.title = blog.value.title;
    editForm.value.content = blog.value.content;
    showEditModal.value = true;
}

function openDeleteModal() {
    closeMenu();
    if (!blog.value) return;
    showDeleteModal.value = true;
}

function closeDeleteModal() {
    if (!isDeletingBlog.value) {
        showDeleteModal.value = false;
    }
}

function handleKeydown(e) {
    if (e.key === 'Escape') {
        closeMenu();
        if (!isUpdatingBlog.value) {
            showEditModal.value = false;
        }
        closeDeleteModal();
    }
}

async function handleUpdateBlog(e) {
    e.preventDefault();
    if (!blog.value) return;

    isUpdatingBlog.value = true;
    try {
        const { data } = await api.patch(`/blogs/update/${blog.value._id}`, {
            title: editForm.value.title.trim(),
            content: editForm.value.content.trim()
        });
        blog.value.title = data?.blog?.title ?? editForm.value.title.trim();
        blog.value.content = data?.blog?.content ?? editForm.value.content.trim();
        notyf.success('Blog post updated!');
        showEditModal.value = false;
    } catch (err) {
        notyf.error(err.response?.data?.message ?? 'Failed to update blog post.');
    } finally {
        isUpdatingBlog.value = false;
    }
}

async function handleDeleteBlog() {
    if (!blog.value) return;

    isDeletingBlog.value = true;
    try {
        await api.delete(`/blogs/delete/${blog.value._id}`);
        notyf.success('Blog post deleted.');
        showDeleteModal.value = false;
        router.push({ path: '/blogs' });
    } catch (err) {
        notyf.error(err.response?.data?.message ?? 'Failed to delete blog post.');
    } finally {
        isDeletingBlog.value = false;
    }
}

async function fetchComments(fallback = []) {
    try {
        const { data } = await api.get(`/blogs/getComment/${blogId}`);
        comments.value = Array.isArray(data) ? data : (data?.comments ?? fallback);
    } catch {
        comments.value = fallback;
    }
}

async function fetchBlog() {
    isLoading.value = true;
    try {
        const { data } = await api.get(`/blogs/getBlogs/${blogId}`);
        const loaded = data?.blog ?? data;
        blog.value = loaded;
        await fetchComments(Array.isArray(loaded?.comments) ? loaded.comments : []);
    } catch (err) {
        notyf.error(err.response?.data?.message ?? 'Failed to load blog details.');
        blog.value = null;
    } finally {
        isLoading.value = false;
    }
}

async function handleAddComment(e) {
    e.preventDefault();
    const text = newComment.value.trim();
    if (!text) return;

    isSubmittingComment.value = true;
    try {
        await api.post(`/blogs/addComment/${blogId}`, { text });
        notyf.success('Comment added!');
        newComment.value = '';
        await fetchComments(comments.value);
    } catch (err) {
        notyf.error(err.response?.data?.message ?? 'Failed to post comment.');
    } finally {
        isSubmittingComment.value = false;
    }
}

onMounted(() => {
    fetchBlog();
    window.addEventListener('click', closeMenu);
    window.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
    window.removeEventListener('click', closeMenu);
    window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
    <div class="blog-details-shell py-4 py-md-5">
        <div class="container blog-details-container">
            <!-- Top Navigation Bar -->
            <nav class="d-flex align-items-center justify-content-between mb-4">
                <router-link :to="{ path: '/blogs' }" class="blog-details-back">
                    <span class="blog-details-back__icon">
                        <i class="bi bi-arrow-left"></i>
                    </span>
                    <span>All Posts</span>
                </router-link>

                <div v-if="blog && isBlogAuthor" class="blog-details-menu" @click.stop>
                    <button
                        type="button"
                        class="blog-details-menu__trigger"
                        aria-label="Post options"
                        :aria-expanded="menuOpen"
                        @click="toggleMenu"
                    >
                        <span>Manage</span>
                        <span class="blog-details-menu__dots">⋮</span>
                    </button>

                    <div v-if="menuOpen" class="blog-details-menu__dropdown" role="menu">
                        <button
                            type="button"
                            class="blog-details-menu__item"
                            role="menuitem"
                            @click="openEditModal"
                        >
                            <i class="bi bi-pencil-square"></i>
                            <span>Edit Post</span>
                        </button>
                        <button
                            type="button"
                            class="blog-details-menu__item blog-details-menu__item--danger"
                            role="menuitem"
                            @click="openDeleteModal"
                        >
                            <i class="bi bi-trash3"></i>
                            <span>Delete Post</span>
                        </button>
                    </div>
                </div>
            </nav>

            <!-- Loading State -->
            <div v-if="isLoading" class="blog-details-card rounded-4 p-5 text-center">
                <div class="spinner-border blog-details-spinner mb-2" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <div class="small blog-details-muted">Fetching story...</div>
            </div>

            <!-- Main Article & Discussion -->
            <template v-else-if="blog">
                <article class="blog-details-card rounded-4 overflow-hidden mb-4">
                    <div class="blog-details-accent-bar"></div>

                    <div class="p-4 p-md-5">
                        <!-- Eyebrow Metadata -->
                        <div class="blog-details-meta mb-3">
                            <span class="blog-details-meta__author">
                                <span class="blog-details-avatar">
                                    {{ String(blog.author).slice(0, 2).toUpperCase() }}
                                </span>
                                <span class="blog-details-meta__id">{{ blog.author }}</span>
                            </span>
                            <span class="blog-details-meta__dot">•</span>
                            <span>{{ formatDate(blog.createdDate) }}</span>
                            <span class="blog-details-meta__dot">•</span>
                            <span>{{ readingTime }}</span>
                        </div>

                        <!-- Article Title -->
                        <h1 class="fw-bold blog-details-title mb-4">
                            {{ blog.title }}
                        </h1>

                        <!-- Article Content -->
                        <div class="blog-details-content">
                            {{ blog.content }}
                        </div>
                    </div>
                </article>

                <!-- Discussion Section -->
                <section class="blog-details-card rounded-4 p-4 p-md-5" aria-label="Comments">
                    <div class="d-flex align-items-center justify-content-between mb-4">
                        <div class="d-flex align-items-center gap-2">
                            <h2 class="h5 fw-bold blog-details-title mb-0">Discussion</h2>
                            <span class="blog-details-badge">{{ comments.length }}</span>
                        </div>
                    </div>

                    <!-- Comment Composer -->
                    <form v-if="isLoggedIn" @submit="handleAddComment" class="blog-details-composer rounded-3 p-3 mb-4">
                        <textarea
                            v-model="newComment"
                            rows="3"
                            class="form-control blog-details-textarea"
                            placeholder="Add a thoughtful comment..."
                        ></textarea>
                        <div class="d-flex align-items-center justify-content-between pt-2 mt-2 blog-details-composer__bar">
                            <span class="small blog-details-muted">
                                {{ newComment.trim().length }} characters
                            </span>
                            <button
                                type="submit"
                                class="btn blog-details-btn px-4 py-2 fw-semibold"
                                :disabled="isSubmittingComment || !newComment.trim()"
                            >
                                {{ isSubmittingComment ? 'Posting...' : 'Post Comment' }}
                            </button>
                        </div>
                    </form>

                    <!-- Guest Login Prompt -->
                    <div v-else class="blog-details-guest rounded-3 p-3 p-md-4 mb-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
                        <div class="d-flex align-items-center gap-2">
                            <i class="bi bi-chat-square-text blog-details-guest__icon"></i>
                            <span class="small blog-details-muted">Sign in to join the conversation.</span>
                        </div>
                        <router-link :to="{ name: 'Login' }" class="btn blog-details-btn-secondary btn-sm px-3">
                            Log in
                        </router-link>
                    </div>

                    <!-- Empty Comments -->
                    <div v-if="comments.length === 0" class="blog-details-empty rounded-3 py-5 px-3 text-center">
                        <i class="bi bi-chat-dots fs-4 d-block mb-2"></i>
                        <p class="small mb-0">No comments yet. Start the thread above.</p>
                    </div>

                    <!-- Comment Thread -->
                    <div v-else class="blog-details-thread">
                        <div
                            v-for="item in comments"
                            :key="item._id"
                            class="blog-details-comment"
                        >
                            <div class="blog-details-comment__avatar">
                                {{ String(item.user).slice(0, 2).toUpperCase() }}
                            </div>
                            <div class="blog-details-comment__panel rounded-3 p-3">
                                <div class="d-flex align-items-center justify-content-between gap-2 mb-1">
                                    <span class="small fw-semibold blog-details-comment-author">
                                        {{ item.user }}
                                    </span>
                                    <span v-if="item.createdDate" class="blog-details-comment-date">
                                        {{ formatDate(item.createdDate) }}
                                    </span>
                                </div>
                                <div class="small blog-details-comment-body">
                                    {{ item.text }}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </template>

            <!-- Not Found State -->
            <div v-else class="blog-details-card rounded-4 p-5 text-center blog-details-muted">
                Blog post not found.
            </div>
        </div>

        <!-- Edit Modal -->
        <div
            v-if="showEditModal"
            class="blog-details-modal-backdrop"
            role="dialog"
            aria-modal="true"
            aria-label="Edit Blog Post"
            @click.self="showEditModal = false"
        >
            <div class="blog-details-modal">
                <form @submit="handleUpdateBlog">
                    <div class="blog-details-modal__head">
                        <h5 class="blog-details-modal__title">Edit Post</h5>
                        <button
                            type="button"
                            class="blog-details-modal__close"
                            aria-label="Close"
                            @click="showEditModal = false"
                        >
                            ×
                        </button>
                    </div>

                    <div class="blog-details-modal__body">
                        <div class="mb-3">
                            <label for="blogDetailsTitleInput" class="form-label blog-details-label">Title</label>
                            <input
                                id="blogDetailsTitleInput"
                                v-model="editForm.title"
                                type="text"
                                class="form-control blog-details-input"
                                required
                            />
                        </div>

                        <div>
                            <label for="blogDetailsContentInput" class="form-label blog-details-label">Content</label>
                            <textarea
                                id="blogDetailsContentInput"
                                v-model="editForm.content"
                                rows="6"
                                class="form-control blog-details-input"
                                required
                            ></textarea>
                        </div>
                    </div>

                    <div class="blog-details-modal__foot">
                        <button
                            type="button"
                            class="btn blog-details-btn-secondary"
                            @click="showEditModal = false"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            class="btn blog-details-btn fw-semibold"
                            :disabled="isUpdatingBlog"
                        >
                            {{ isUpdatingBlog ? 'Saving...' : 'Save Changes' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <div
            v-if="showDeleteModal"
            class="blog-details-modal-backdrop"
            role="dialog"
            aria-modal="true"
            aria-label="Delete Blog Post"
            @click.self="closeDeleteModal"
        >
            <div class="blog-details-modal">
                <div class="blog-details-modal__head">
                    <h5 class="blog-details-modal__title">Delete Post</h5>
                    <button
                        type="button"
                        class="blog-details-modal__close"
                        aria-label="Close"
                        :disabled="isDeletingBlog"
                        @click="closeDeleteModal"
                    >
                        ×
                    </button>
                </div>

                <div class="blog-details-modal__body">
                    <p class="mb-2 blog-details-title fw-semibold">
                        Are you sure you want to delete this post?
                    </p>
                    <p class="small mb-0 blog-details-muted">
                        “{{ blog?.title }}” and its comments will be permanently removed. This action cannot be undone.
                    </p>
                </div>

                <div class="blog-details-modal__foot">
                    <button
                        type="button"
                        class="btn blog-details-btn-secondary"
                        :disabled="isDeletingBlog"
                        @click="closeDeleteModal"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        class="btn blog-details-btn-danger fw-semibold"
                        :disabled="isDeletingBlog"
                        @click="handleDeleteBlog"
                    >
                        {{ isDeletingBlog ? 'Deleting...' : 'Delete Post' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.blog-details-shell {
    min-height: 100vh;
    background-color: var(--bg-page);
    color: var(--text-primary);
}

.blog-details-container {
    max-width: 100%;
}

.blog-details-back {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    text-decoration: none;
    color: var(--text-secondary);
    font-size: 0.875rem;
    font-weight: 600;
    padding: 0.35rem 0.75rem 0.35rem 0.4rem;
    background-color: var(--bg-surface);
    border: 1px solid var(--border-light);
    border-radius: 999px;
    transition: border-color 0.15s ease, color 0.15s ease, background-color 0.15s ease;
}

.blog-details-back__icon {
    width: 1.65rem;
    height: 1.65rem;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-color: var(--bg-subtle);
    color: var(--text-primary);
    font-size: 0.8rem;
}

.blog-details-back:hover {
    color: var(--text-primary);
    border-color: var(--border-strong);
    background-color: var(--bg-subtle);
}

.blog-details-spinner {
    color: var(--accent-primary);
}

.blog-details-card {
    background-color: var(--bg-surface);
    border: 1px solid var(--border-light);
    box-shadow: 0 12px 30px -18px rgba(28, 25, 23, 0.16);
}

.blog-details-accent-bar {
    height: 4px;
    background: linear-gradient(90deg, var(--accent-primary), var(--accent-hover));
}

.blog-details-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8125rem;
    color: var(--text-muted);
}

.blog-details-meta__author {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    color: var(--text-primary);
    font-weight: 600;
}

.blog-details-meta__id {
    max-width: 180px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.blog-details-meta__dot {
    opacity: 0.5;
}

.blog-details-avatar {
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
}

.blog-details-menu {
    position: relative;
}

.blog-details-menu__trigger {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.4rem 0.75rem;
    background-color: var(--bg-surface);
    color: var(--text-secondary);
    border: 1px solid var(--border-strong);
    border-radius: 999px;
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.15s ease, color 0.15s ease;
}

.blog-details-menu__trigger:hover {
    background-color: var(--bg-subtle);
    color: var(--text-primary);
}

.blog-details-menu__dots {
    font-size: 1rem;
    line-height: 1;
}

.blog-details-menu__dropdown {
    position: absolute;
    top: calc(100% + 0.4rem);
    right: 0;
    z-index: 30;
    min-width: 160px;
    background-color: var(--bg-surface);
    border: 1px solid var(--border-strong);
    border-radius: 12px;
    box-shadow: 0 14px 28px -10px rgba(28, 25, 23, 0.2);
    padding: 0.35rem;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
}

.blog-details-menu__item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.55rem;
    text-align: left;
    background: transparent;
    border: none;
    border-radius: 8px;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-primary);
    cursor: pointer;
    transition: background-color 0.15s ease, color 0.15s ease;
}

.blog-details-menu__item:hover {
    background-color: var(--bg-subtle);
}

.blog-details-menu__item--danger {
    color: var(--status-danger);
}

.blog-details-menu__item--danger:hover {
    background-color: color-mix(in srgb, var(--status-danger) 10%, transparent);
    color: var(--status-danger);
}

.blog-details-title {
    color: var(--text-primary);
    letter-spacing: -0.025em;
    line-height: 1.22;
}

.blog-details-content {
    color: var(--text-secondary);
    font-size: 1.0625rem;
    line-height: 1.85;
    padding-left: 1.15rem;
    border-left: 3px solid var(--accent-soft);
    white-space: pre-line;
}

.blog-details-badge {
    background-color: var(--accent-soft);
    color: var(--accent-hover);
    border-radius: 999px;
    padding: 0.15rem 0.65rem;
    font-size: 0.75rem;
    font-weight: 700;
}

.blog-details-composer {
    background-color: var(--bg-page);
    border: 1px solid var(--border-strong);
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.blog-details-composer:focus-within {
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px var(--accent-soft);
}

.blog-details-textarea {
    background: transparent;
    border: none;
    padding: 0;
    color: var(--text-primary);
    font-size: 0.95rem;
    resize: vertical;
}

.blog-details-textarea:focus {
    background: transparent;
    color: var(--text-primary);
    box-shadow: none;
}

.blog-details-textarea::placeholder {
    color: var(--text-muted);
}

.blog-details-composer__bar {
    border-top: 1px solid var(--border-light);
}

.blog-details-guest {
    background-color: var(--bg-page);
    border: 1px solid var(--border-light);
}

.blog-details-guest__icon {
    color: var(--accent-primary);
    font-size: 1.1rem;
}

.blog-details-empty {
    background-color: var(--bg-page);
    border: 1px dashed var(--border-strong);
    color: var(--text-muted);
}

.blog-details-thread {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.blog-details-comment {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
}

.blog-details-comment__avatar {
    flex-shrink: 0;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background-color: var(--bg-subtle);
    border: 1px solid var(--border-strong);
    color: var(--text-secondary);
    font-size: 0.7rem;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-top: 0.15rem;
}

.blog-details-comment__panel {
    flex: 1;
    min-width: 0;
    background-color: var(--bg-page);
    border: 1px solid var(--border-light);
}

.blog-details-comment-author {
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.blog-details-comment-date {
    flex-shrink: 0;
    color: var(--text-muted);
    font-size: 0.75rem;
}

.blog-details-comment-body {
    color: var(--text-secondary);
    line-height: 1.6;
    white-space: pre-line;
}

.blog-details-label {
    color: var(--text-primary);
    font-weight: 600;
    font-size: 0.875rem;
}

.blog-details-input {
    background-color: var(--bg-page);
    color: var(--text-primary);
    border: 1px solid var(--border-strong);
    border-radius: 10px;
    font-size: 0.95rem;
}

.blog-details-input:focus {
    background-color: var(--bg-surface);
    color: var(--text-primary);
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px var(--accent-soft);
}

.blog-details-btn {
    background-color: var(--accent-primary);
    color: #ffffff;
    border: 1px solid var(--accent-primary);
    border-radius: 8px;
    font-size: 0.875rem;
    transition: background-color 0.15s ease, border-color 0.15s ease;
}

.blog-details-btn:hover:not(:disabled) {
    background-color: var(--accent-hover);
    border-color: var(--accent-hover);
    color: #ffffff;
}

.blog-details-btn-secondary {
    background-color: var(--bg-surface);
    color: var(--text-secondary);
    border: 1px solid var(--border-strong);
    border-radius: 8px;
    font-weight: 600;
}

.blog-details-btn-secondary:hover:not(:disabled) {
    background-color: var(--bg-subtle);
    color: var(--text-primary);
}

.blog-details-btn-danger {
    background-color: var(--status-danger);
    color: #ffffff;
    border: 1px solid var(--status-danger);
    border-radius: 8px;
    font-size: 0.875rem;
    transition: opacity 0.15s ease, background-color 0.15s ease;
}

.blog-details-btn-danger:hover:not(:disabled) {
    opacity: 0.9;
    color: #ffffff;
}

.blog-details-muted {
    color: var(--text-muted);
}

.blog-details-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1050;
    background-color: rgba(28, 25, 23, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
}

.blog-details-modal {
    width: 100%;
    max-width: 540px;
    background-color: var(--bg-surface);
    border: 1px solid var(--border-light);
    border-radius: 14px;
    box-shadow: 0 20px 40px -12px rgba(28, 25, 23, 0.25);
    overflow: hidden;
}

.blog-details-modal__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.1rem 1.4rem;
    background-color: var(--bg-subtle);
    border-bottom: 1px solid var(--border-light);
}

.blog-details-modal__title {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--text-primary);
}

.blog-details-modal__close {
    background: transparent;
    border: none;
    font-size: 1.45rem;
    line-height: 1;
    color: var(--text-muted);
    cursor: pointer;
    padding: 0 0.25rem;
}

.blog-details-modal__close:hover:not(:disabled) {
    color: var(--text-primary);
}

.blog-details-modal__body {
    padding: 1.4rem;
}

.blog-details-modal__foot {
    display: flex;
    justify-content: flex-end;
    gap: 0.6rem;
    padding: 1rem 1.4rem;
    background-color: var(--bg-subtle);
    border-top: 1px solid var(--border-light);
}
</style>