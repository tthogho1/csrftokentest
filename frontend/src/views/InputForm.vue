<template>
  <div class="form-container">
    <h1>情報入力</h1>

    <form @submit.prevent="handleSubmit" novalidate>
      <!-- Name field (EARS-009: max 50 chars) -->
      <div class="form-group">
        <label for="name">名前</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          maxlength="50"
          placeholder="名前を入力してください（最大50文字）"
          @blur="validateName"
        />
        <span v-if="errors.name" id="name-error" class="error-message">{{ errors.name }}</span>
      </div>

      <!-- Birthdate field (EARS-010: YYYY-MM-DD format) -->
      <div class="form-group">
        <label for="birthdate">生年月日</label>
        <input
          id="birthdate"
          v-model="form.birthdate"
          type="text"
          placeholder="YYYY-MM-DD"
          @blur="validateBirthdate"
        />
        <span v-if="errors.birthdate" id="birthdate-error" class="error-message">
          {{ errors.birthdate }}
        </span>
      </div>

      <div v-if="submitError" class="submit-error">{{ submitError }}</div>

      <button id="submit-btn" type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? '送信中...' : '確認画面へ' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import apiClient, { setCsrfToken } from '../api/client';

const router = useRouter();

interface FormData {
  name: string;
  birthdate: string;
}

interface FormErrors {
  name: string;
  birthdate: string;
}

const form = reactive<FormData>({
  name: '',
  birthdate: '',
});

const errors = reactive<FormErrors>({
  name: '',
  birthdate: '',
});

const isSubmitting = ref<boolean>(false);
const submitError = ref<string>('');

// EARS-001: On page load, call GET /api/csrf to initialise the client-side token.
// Use plain axios (not apiClient) to avoid triggering the non-GET interceptor.
onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:8080/api/csrf', { withCredentials: true });
    if (res.data && res.data.token) {
      setCsrfToken(res.data.token);
    }
  } catch (err) {
    console.warn('Failed to fetch initial CSRF token:', err);
  }
});

// EARS-009: name max 50 characters
function validateName(): boolean {
  if (!form.name || form.name.trim() === '') {
    errors.name = '名前は必須です';
    return false;
  }
  if (form.name.length > 50) {
    errors.name = '名前は50文字以内で入力してください';
    return false;
  }
  errors.name = '';
  return true;
}

// EARS-010: birthdate YYYY-MM-DD format
function validateBirthdate(): boolean {
  if (!form.birthdate || form.birthdate.trim() === '') {
    errors.birthdate = '生年月日は必須です（YYYY-MM-DD形式）';
    return false;
  }
  const pattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!pattern.test(form.birthdate)) {
    errors.birthdate = '生年月日はYYYY-MM-DD形式で入力してください';
    return false;
  }
  errors.birthdate = '';
  return true;
}

function validateAll(): boolean {
  const nameValid = validateName();
  const birthdateValid = validateBirthdate();
  return nameValid && birthdateValid;
}

// EARS-005: POST /api/submit with X-CSRF-TOKEN header (attached by apiClient interceptor)
async function handleSubmit() {
  submitError.value = '';

  if (!validateAll()) {
    return;
  }

  isSubmitting.value = true;
  try {
    const res = await apiClient.post('/submit', {
      name: form.name,
      birthdate: form.birthdate,
    });

    // Store confirmed data for the confirmation screen
    sessionStorage.setItem('submitData', JSON.stringify(res.data));

    router.push('/confirm');
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 403) {
      submitError.value =
        'セキュリティエラー: CSRFトークンが無効です。ページを再読み込みしてください。';
    } else {
      submitError.value = '送信中にエラーが発生しました。もう一度お試しください。';
    }
    console.error('Submit error:', err);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.form-container {
  background: #fff;
  border-radius: 8px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 1.5rem;
  margin-bottom: 24px;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  font-weight: 600;
  margin-bottom: 6px;
  color: #555;
}

input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

input:focus {
  outline: none;
  border-color: #42b883;
}

.error-message {
  display: block;
  margin-top: 4px;
  color: #e74c3c;
  font-size: 0.875rem;
}

.submit-error {
  margin-bottom: 16px;
  padding: 10px 14px;
  background: #fdecea;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  color: #c0392b;
  font-size: 0.9rem;
}

button {
  width: 100%;
  padding: 12px;
  background-color: #42b883;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover:not(:disabled) {
  background-color: #369a6e;
}

button:disabled {
  background-color: #a0d8c2;
  cursor: not-allowed;
}
</style>
