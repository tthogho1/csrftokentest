<template>
  <div class="form-container">
    <h1>入力内容の確認</h1>

    <div class="confirm-table">
      <div class="confirm-row">
        <span class="confirm-label">名前</span>
        <span class="confirm-value">{{ submitData.name }}</span>
      </div>
      <div class="confirm-row">
        <span class="confirm-label">生年月日</span>
        <span class="confirm-value">{{ submitData.birthdate }}</span>
      </div>
    </div>

    <div v-if="confirmError" class="submit-error">{{ confirmError }}</div>

    <div class="button-group">
      <button id="back-btn" type="button" @click="goBack" :disabled="isSubmitting">戻る</button>
      <button id="confirm-btn" type="button" @click="handleConfirm" :disabled="isSubmitting">
        {{ isSubmitting ? '送信中...' : '登録する' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import apiClient from '../api/client';

const router = useRouter();

interface SubmitData {
  name: string;
  birthdate: string;
}

const submitData = reactive<SubmitData>({
  name: '',
  birthdate: '',
});

const isSubmitting = ref<boolean>(false);
const confirmError = ref<string>('');

onMounted(() => {
  const stored = sessionStorage.getItem('submitData');
  if (stored) {
    const parsed = JSON.parse(stored);
    submitData.name = parsed.name || '';
    submitData.birthdate = parsed.birthdate || '';
  } else {
    // No data available - redirect back to input form
    router.push('/');
  }
});

function goBack() {
  router.push('/');
}

// EARS-006: POST /api/confirm with X-CSRF-TOKEN header (attached by apiClient interceptor)
async function handleConfirm() {
  confirmError.value = '';
  isSubmitting.value = true;

  try {
    await apiClient.post('/confirm', {
      name: submitData.name,
      birthdate: submitData.birthdate,
    });

    // Clear stored data and redirect to top on success
    sessionStorage.removeItem('submitData');
    router.push('/');
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 403) {
      confirmError.value =
        'セキュリティエラー: CSRFトークンが無効です。最初からやり直してください。';
    } else {
      confirmError.value = '登録中にエラーが発生しました。もう一度お試しください。';
    }
    console.error('Confirm error:', err);
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

.confirm-table {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 24px;
  overflow: hidden;
}

.confirm-row {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
}

.confirm-row:last-child {
  border-bottom: none;
}

.confirm-label {
  width: 140px;
  padding: 12px 16px;
  background: #f8f8f8;
  font-weight: 600;
  color: #555;
  flex-shrink: 0;
}

.confirm-value {
  padding: 12px 16px;
  color: #333;
  word-break: break-all;
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

.button-group {
  display: flex;
  gap: 12px;
}

button {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

#back-btn {
  background-color: #95a5a6;
  color: #fff;
}

#back-btn:hover:not(:disabled) {
  background-color: #7f8c8d;
}

#confirm-btn {
  background-color: #2980b9;
  color: #fff;
}

#confirm-btn:hover:not(:disabled) {
  background-color: #1f6897;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
