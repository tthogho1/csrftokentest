<template>
  <div id="app-root">
    <h1>CSRF Header Token Test</h1>

    <!-- Token status (EARS-003) -->
    <section class="card">
      <h2>CSRF Token (sessionStorage)</h2>
      <div id="token-status" class="token-box">
        <span v-if="csrfToken" class="token-value">{{ csrfToken }}</span>
        <span v-else class="token-missing">未取得 — GETリクエストを送信してください</span>
      </div>
    </section>

    <!-- GET request (triggers token acquisition via response header) -->
    <section class="card">
      <h2>GET /api/secure/data</h2>
      <button id="btn-get" @click="sendGet">GET リクエスト送信</button>
      <div v-if="getResult" id="get-result" class="result" :class="getResult.ok ? 'ok' : 'err'">
        {{ getResult.message }}
      </div>
    </section>

    <!-- POST request (EARS-004: auto X-CSRF-TOKEN injection) -->
    <section class="card">
      <h2>POST /api/secure/data</h2>
      <button id="btn-post" @click="sendPost">POST リクエスト送信</button>
      <div v-if="postResult" id="post-result" class="result" :class="postResult.ok ? 'ok' : 'err'">
        {{ postResult.message }}
      </div>
    </section>

    <!-- PUT request -->
    <section class="card">
      <h2>PUT /api/secure/data</h2>
      <button id="btn-put" @click="sendPut">PUT リクエスト送信</button>
      <div v-if="putResult" id="put-result" class="result" :class="putResult.ok ? 'ok' : 'err'">
        {{ putResult.message }}
      </div>
    </section>

    <!-- DELETE request -->
    <section class="card">
      <h2>DELETE /api/secure/data</h2>
      <button id="btn-delete" @click="sendDelete">DELETE リクエスト送信</button>
      <div v-if="deleteResult" id="delete-result" class="result" :class="deleteResult.ok ? 'ok' : 'err'">
        {{ deleteResult.message }}
      </div>
    </section>

    <!-- PATCH request -->
    <section class="card">
      <h2>PATCH /api/secure/data</h2>
      <button id="btn-patch" @click="sendPatch">PATCH リクエスト送信</button>
      <div v-if="patchResult" id="patch-result" class="result" :class="patchResult.ok ? 'ok' : 'err'">
        {{ patchResult.message }}
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import api, { CSRF_STORAGE_KEY } from './api/client'

interface RequestResult {
  ok: boolean
  message: string
}

const csrfToken = ref<string | null>(null)
const getResult = ref<RequestResult | null>(null)
const postResult = ref<RequestResult | null>(null)
const putResult = ref<RequestResult | null>(null)
const deleteResult = ref<RequestResult | null>(null)
const patchResult = ref<RequestResult | null>(null)

function refreshToken(): void {
  csrfToken.value = sessionStorage.getItem(CSRF_STORAGE_KEY)
}

// EARS-001/003: On mount, send GET to establish session and receive the token in the response header.
// The Axios response interceptor will save it to sessionStorage automatically.
onMounted(async () => {
  try {
    await api.get('/secure/data')
    refreshToken()
  } catch (err) {
    console.warn('Initial GET failed:', err)
  }
})

async function sendGet(): Promise<void> {
  try {
    const res = await api.get<{ message: string }>('/secure/data')
    getResult.value = { ok: true, message: res.data.message }
    refreshToken()
  } catch (err) {
    getResult.value = { ok: false, message: 'GETリクエスト失敗' }
  }
}

async function sendPost(): Promise<void> {
  try {
    const res = await api.post<{ message: string }>('/secure/data', { message: 'test' })
    postResult.value = { ok: true, message: res.data.message }
    refreshToken()
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 403) {
      postResult.value = { ok: false, message: 'CSRF検証失敗 (403)' }
    } else {
      postResult.value = { ok: false, message: 'POSTリクエスト失敗' }
    }
  }
}

async function sendPut(): Promise<void> {
  try {
    const res = await api.put<{ message: string }>('/secure/data', { message: 'update' })
    putResult.value = { ok: true, message: res.data.message }
    refreshToken()
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 403) {
      putResult.value = { ok: false, message: 'CSRF検証失敗 (403)' }
    } else {
      putResult.value = { ok: false, message: 'PUTリクエスト失敗' }
    }
  }
}

async function sendDelete(): Promise<void> {
  try {
    const res = await api.delete<{ message: string }>('/secure/data')
    deleteResult.value = { ok: true, message: res.data.message }
    refreshToken()
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 403) {
      deleteResult.value = { ok: false, message: 'CSRF検証失敗 (403)' }
    } else {
      deleteResult.value = { ok: false, message: 'DELETEリクエスト失敗' }
    }
  }
}

async function sendPatch(): Promise<void> {
  try {
    const res = await api.patch<{ message: string }>('/secure/data', { message: 'patch' })
    patchResult.value = { ok: true, message: res.data.message }
    refreshToken()
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 403) {
      patchResult.value = { ok: false, message: 'CSRF検証失敗 (403)' }
    } else {
      patchResult.value = { ok: false, message: 'PATCHリクエスト失敗' }
    }
  }
}
</script>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #f0f2f5;
  color: #333;
}
#app-root {
  max-width: 700px;
  margin: 32px auto;
  padding: 0 16px;
}
h1 {
  font-size: 1.6rem;
  margin-bottom: 24px;
  color: #2c3e50;
}
.card {
  background: #fff;
  border-radius: 8px;
  padding: 20px 24px;
  margin-bottom: 16px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
}
h2 { font-size: 1rem; margin-bottom: 12px; color: #555; }
.token-box {
  padding: 10px 14px;
  background: #f8f8f8;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.85rem;
  word-break: break-all;
}
.token-value { color: #27ae60; }
.token-missing { color: #aaa; font-style: italic; }
button {
  padding: 9px 20px;
  background: #3498db;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
}
button:hover { background: #2980b9; }
.result {
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 0.9rem;
}
.result.ok { background: #eafaf1; color: #1e8449; border: 1px solid #a9dfbf; }
.result.err { background: #fdedec; color: #c0392b; border: 1px solid #f5b7b1; }
</style>
