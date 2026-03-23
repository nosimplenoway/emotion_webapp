<template>
  <div class="modal-backdrop" @click.self="close">
    <div class="modal-card">
      <div class="modal-header">
        <div class="modal-title"><strong>{{ title }}</strong></div>
        <button class="modal-close" @click="close" aria-label="关闭">✕</button>
      </div>
      <div class="modal-body">
        <slot />
      </div>
      <div class="modal-footer">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineEmits, defineProps } from 'vue'
const props = defineProps({ title: { type: String, default: '' } })
const emit = defineEmits(['close'])
function close(){ emit('close') }
</script>

<style scoped>
.modal-backdrop{position:fixed;inset:0;background:rgba(2,6,23,0.45);display:flex;align-items:center;justify-content:center;z-index:40}
.modal-card{width:520px;background:var(--card);border-radius:10px;padding:18px;box-shadow:var(--shadow);border:1px solid var(--surface-border)}
.modal-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;padding:6px 2px;border-bottom:1px solid var(--surface-border)}
.modal-title{font-size:16px}
.modal-close{background:#fff;border:1px solid var(--surface-border);border-radius:8px;padding:6px 8px;color:var(--muted);cursor:pointer}
.modal-close:hover{background:#ffefef;color:#ff4d4f;border-color:#ffd6d6}
.modal-body{padding:16px 4px}
.modal-footer{display:flex;justify-content:flex-end;gap:8px;padding-top:12px}
</style>
