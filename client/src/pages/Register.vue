<script setup>
import { watch, ref, onBeforeMount } from 'vue';
import { Notyf } from 'notyf';
import { useRouter } from 'vue-router';
import { useGlobalStore } from '../stores/global.js';
import api from '../api.js';

const email = ref("");
const password = ref("");
const confirmPass = ref("");
const isEnabled = ref(false);

const notyf = new Notyf();
const router = useRouter();
const { user } = useGlobalStore();

watch([email, password, confirmPass], ([currentEmail, currentPassword, currentConfirmPass]) => {
    if (
        currentEmail.trim() !== "" &&
        currentPassword !== "" &&
        currentConfirmPass !== "" &&
        currentPassword === currentConfirmPass
    ) {
        isEnabled.value = true;
    } else {
        isEnabled.value = false;
    }
});

async function handleSubmit(e) {
    e.preventDefault();

    try {
        const response = await api.post('/users/register', {
            email: email.value,
            password: password.value
        });

        if (response.status === 201) {
            notyf.success(response.data.message);

            email.value = "";
            password.value = "";
            confirmPass.value = "";

            router.push({ path: '/login' });
        } else {
            notyf.error("Registration Failed. Please contact administrator.");
        }
    } catch (e) {
        if (
            e.response &&
            (e.response.status === 404 ||
                e.response.status === 401 ||
                e.response.status === 400 ||
                e.response.status === 409)
        ) {
            notyf.error(e.response.data.message);
        } else {
            notyf.error("Registration Failed. Please contact administrator.");
        }
    }
}

onBeforeMount(() => {
    if (user.token) {
        router.push({ path: '/blogs' });
    }
});
</script>

<template>
    <div class="auth-shell container-fluid min-vh-100 d-flex align-items-start justify-content-center pt-5 px-3 pb-5">
        <div class="auth-panel rounded-4 p-4 p-md-5 w-100 mt-2 shadow-sm">
            <div class="mb-4 text-center">
                <div class="auth-brand-badge d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-3">
                    <i class="bi bi-journal-richtext"></i>
                    <span class="fw-semibold small">Blogy</span>
                </div>
                <h1 class="auth-heading h2 fw-bold mb-1">Create Account</h1>
                <p class="auth-subtext small mb-0">Join Blogy to publish posts and share your thoughts</p>
            </div>

            <form @submit="handleSubmit">
                <div class="mb-3">
                    <label for="emailInput" class="form-label auth-label">Email Address</label>
                    <input
                        type="email"
                        class="form-control auth-field"
                        id="emailInput"
                        placeholder="you@domain.com"
                        v-model="email"
                    />
                </div>

                <div class="mb-3">
                    <label for="passwordInput" class="form-label auth-label">Password</label>
                    <input
                        type="password"
                        class="form-control auth-field"
                        id="passwordInput"
                        placeholder="Create a password"
                        v-model="password"
                    />
                </div>

                <div class="mb-4">
                    <label for="cpasswordInput" class="form-label auth-label">Confirm Password</label>
                    <input
                        type="password"
                        class="form-control auth-field"
                        id="cpasswordInput"
                        placeholder="Repeat your password"
                        v-model="confirmPass"
                    />
                    <div
                        v-if="confirmPass && password !== confirmPass"
                        class="auth-mismatch small mt-1"
                    >
                        Passwords do not match.
                    </div>
                </div>

                <div class="d-grid pt-2">
                    <button type="submit" class="btn auth-btn-active py-2 rounded-pill fw-semibold" v-if="isEnabled">
                        Create Account
                    </button>
                    <button type="submit" class="btn auth-btn-disabled py-2 rounded-pill fw-semibold" disabled v-else>
                        Create Account
                    </button>
                </div>
            </form>

            <p class="auth-switch text-center small mt-4 mb-0">
                Already have an account?
                <router-link :to="{ name: 'Login' }" class="auth-link fw-semibold">Login</router-link>
            </p>
        </div>
    </div>
</template>

<style scoped>
.auth-shell {
    background-color: var(--bg-page);
}

.auth-panel {
    max-width: 520px;
    background-color: var(--bg-surface);
    border: 1px solid var(--border-light);
}

.auth-brand-badge {
    background-color: var(--accent-soft);
    color: var(--accent-primary);
}

.auth-heading {
    color: var(--text-primary);
}

.auth-subtext {
    color: var(--text-secondary);
}

.auth-label {
    color: var(--text-primary);
    font-weight: 500;
    font-size: 0.9rem;
}

.auth-field {
    background-color: var(--bg-page);
    color: var(--text-primary);
    border: 1px solid var(--border-strong);
    padding: 0.65rem 0.9rem;
    transition: border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
}

.auth-field::placeholder {
    color: var(--text-muted);
}

.auth-field:focus {
    background-color: var(--bg-surface);
    color: var(--text-primary);
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px var(--accent-soft);
}

.auth-mismatch {
    color: var(--status-danger);
}

.auth-btn-active {
    background-color: var(--accent-primary);
    border: 1.5px solid var(--accent-primary);
    color: #ffffff;
    transition: all 0.2s ease;
}

.auth-btn-active:hover {
    background-color: var(--accent-hover);
    border-color: var(--accent-hover);
    color: #ffffff;
}

.auth-btn-disabled {
    background-color: var(--bg-subtle);
    border: 1.5px solid var(--border-light);
    color: var(--text-muted);
    cursor: not-allowed;
}

.auth-switch {
    color: var(--text-secondary);
}

.auth-link {
    color: var(--accent-primary);
    text-decoration: none;
    transition: color 0.2s ease;
}

.auth-link:hover {
    color: var(--accent-hover);
    text-decoration: underline;
}
</style>