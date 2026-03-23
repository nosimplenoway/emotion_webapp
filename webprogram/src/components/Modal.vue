<template>
  <div class="modal-backdrop" @click.self="close">
    <div class="modal-card">
      <div class="modal-header">
        <strong>{{ title }}</strong>
        <button class="btn btn-ghost" @click="close">✕</button>
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
.modal-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
.modal-body{padding-bottom:12px}
.modal-footer{display:flex;justify-content:flex-end;gap:8px}
</style>
