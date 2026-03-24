<template>
  <div class="container">
    <h2>日志管理</h2>
    <div class="card" style="margin-top:12px">
      <div class="query-panel">
        <div class="query-grid">
          <div>
            <label class="label">操作人id</label>
            <input class="input" v-model.trim="query.operatorId" placeholder="请输入操作人id" />
          </div>
          <div>
            <label class="label">操作人类型</label>
            <select class="input" v-model="query.operatorType">
              <option value="">全部</option>
              <option value="admin">管理员</option>
              <option value="system">系统</option>
              <option value="teacher">教师</option>
            </select>
          </div>
          <div>
            <label class="label">操作模块</label>
            <input class="input" v-model.trim="query.module" placeholder="如：student / user" />
          </div>
          <div>
            <label class="label">操作类型</label>
            <input class="input" v-model.trim="query.type" placeholder="如：query / export" />
          </div>
          <div>
            <label class="label">操作结果</label>
            <select class="input" v-model="query.result">
              <option value="">全部</option>
              <option value="success">成功</option>
              <option value="fail">失败</option>
            </select>
          </div>
          <div>
            <label class="label">开始时间</label>
            <input class="input" type="datetime-local" v-model="query.startTime" />
          </div>
          <div>
            <label class="label">结束时间</label>
            <input class="input" type="datetime-local" v-model="query.endTime" />
          </div>
          <div class="query-actions">
            <button class="btn btn-primary" :disabled="isLoading" @click="doQuery">查询</button>
            <button class="btn btn-ghost" :disabled="isLoading" @click="resetQuery">重置</button>
          </div>
        </div>
      </div>

      <div class="top-controls" style="margin-top:12px">
        <div class="left tip-text">按时间倒序展示操作日志（共 {{ pagination.total }} 条）</div>
        <div class="right">
          <button
            class="btn btn-ghost"
            :class="{ 'btn-disabled': !isSuperAdmin }"
            :disabled="!isSuperAdmin"
            @click="openLogSwitch"
            :title="isSuperAdmin ? '' : '仅超管开放'"
          >日志记录开关</button>
          <button
            class="btn btn-ghost"
            :class="{ 'btn-disabled': !isSuperAdmin }"
            :disabled="!isSuperAdmin"
            @click="openCleanRule"
            :title="isSuperAdmin ? '' : '仅超管开放'"
          >日志清理规则</button>
          <button
            class="btn btn-ghost"
            :class="{ 'btn-disabled': !isSuperAdmin }"
            :disabled="!isSuperAdmin"
            @click="openMaskRule"
            :title="isSuperAdmin ? '' : '仅超管开放'"
          >日志脱敏规则</button>
          <button class="btn btn-ghost" @click="openHistory">查看日志清理历史</button>
          <button class="btn btn-primary" :disabled="isLoading || isExporting" @click="exportLogs">
            {{ isExporting ? '导出中...' : '导出日志' }}
          </button>
        </div>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>日志id</th>
            <th>操作人id</th>
            <th>操作人类型</th>
            <th>操作模块/类型</th>
            <th>操作时间</th>
            <th>结果</th>
            <th>详情</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoading">
            <td colspan="7">加载中...</td>
          </tr>
          <tr v-else-if="errorMessage">
            <td colspan="7">{{ errorMessage }}</td>
          </tr>
          <tr v-for="l in logs" :key="l.id">
            <td>{{ l.id }}</td>
            <td>{{ l.operatorId }}</td>
            <td>{{ l.operatorTypeText }}</td>
            <td>{{ l.module }} / {{ l.type }}</td>
            <td>{{ l.operationTime }}</td>
            <td>
              <span :class="l.success ? 'status-normal' : 'status-disabled'">{{ l.success ? '成功' : '失败' }}</span>
            </td>
            <td><button class="btn btn-ghost btn-sm" @click="viewLog(l)">查看</button></td>
          </tr>
          <tr v-if="!isLoading && !errorMessage && logs.length === 0">
            <td colspan="7">
              <div class="empty-state">
                <strong>没有匹配数据</strong>
                <div>请调整查询条件后重试</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="pager-row">
        <div class="pager-left">当前第 {{ pagination.page }} 页，每页 {{ pagination.size }} 条</div>
        <div class="pager-right">
          <button class="btn btn-ghost btn-sm" :disabled="pagination.page <= 1 || isLoading" @click="changePage(pagination.page - 1)">上一页</button>
          <button class="btn btn-ghost btn-sm" :disabled="!hasNextPage || isLoading" @click="changePage(pagination.page + 1)">下一页</button>
        </div>
      </div>
    </div>

    <Modal v-if="showLogDetail" title="日志详情" @close="showLogDetail = false">
      <div class="detail-block">{{ currentLog?.detail }}</div>
      <template #footer>
        <button class="btn btn-ghost" @click="showLogDetail = false">关闭</button>
      </template>
    </Modal>

    <Modal v-if="showCleanHistory" title="日志清理历史记录" @close="showCleanHistory = false">
      <div>
        <div class="history-filters">
          <div>
            <label class="label">开始时间</label>
            <input class="input" type="datetime-local" v-model="historyQuery.startTime" />
          </div>
          <div>
            <label class="label">结束时间</label>
            <input class="input" type="datetime-local" v-model="historyQuery.endTime" />
          </div>
          <div>
            <label class="label">清理状态</label>
            <select class="input" v-model="historyQuery.status">
              <option value="">全部</option>
              <option value="成功">成功</option>
              <option value="失败">失败</option>
            </select>
          </div>
          <div class="history-query-btn">
            <button class="btn btn-primary" @click="queryHistory">查询</button>
          </div>
        </div>

        <table class="table history-table">
          <thead>
            <tr>
              <th>日志id</th>
              <th>状态</th>
              <th>清理时间</th>
              <th>清理条数</th>
              <th>清理模块</th>
              <th>操作人</th>
              <th>备注</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="historyLoading">
              <td colspan="7">加载中...</td>
            </tr>
            <tr v-else-if="historyError">
              <td colspan="7">{{ historyError }}</td>
            </tr>
            <tr v-for="h in filteredHistory" :key="h.id">
              <td>{{ h.id }}</td>
              <td>{{ h.status }}</td>
              <td>{{ h.cleanTime }}</td>
              <td>{{ h.cleanedCount }}</td>
              <td>{{ h.cleanModuleText }}</td>
              <td>{{ h.operatorId }}</td>
              <td>{{ h.reason }}</td>
            </tr>
            <tr v-if="!historyLoading && !historyError && filteredHistory.length === 0">
              <td colspan="7">无清理历史记录</td>
            </tr>
          </tbody>
        </table>
        <div class="pager-row" style="margin-top:10px">
          <div class="pager-left">当前第 {{ historyPagination.page }} 页，每页 {{ historyPagination.size }} 条</div>
          <div class="pager-right">
            <button class="btn btn-ghost btn-sm" :disabled="historyPagination.page <= 1 || historyLoading" @click="changeHistoryPage(historyPagination.page - 1)">上一页</button>
            <button class="btn btn-ghost btn-sm" :disabled="!historyHasNextPage || historyLoading" @click="changeHistoryPage(historyPagination.page + 1)">下一页</button>
          </div>
        </div>
      </div>
      <template #footer>
        <button class="btn btn-ghost" @click="showCleanHistory = false">关闭</button>
      </template>
    </Modal>

    <Modal v-if="showCleanRule" title="日志自动清理规则" @close="showCleanRule = false">
      <div>
        <div class="clean-rule-grid">
          <div>
            <label class="label">日志保留天数</label>
            <input class="input" type="number" min="1" v-model.number="cleanRuleForm.retention_days" />
          </div>
          <div>
            <label class="label">定时清理表达式（cron）</label>
            <input class="input" v-model.trim="cleanRuleForm.clean_cron" placeholder="如：0 0 2 * * ?" />
          </div>
        </div>
        <div class="rule-switch">
          <span>日志自动清理开关</span>
          <label class="switch-line">
            <input type="checkbox" v-model="cleanRuleForm.enabled" />
            <span>{{ cleanRuleForm.enabled ? '开启' : '关闭' }}</span>
          </label>
        </div>
        <div style="margin-top:12px">
          <label class="label">清理模块</label>
          <div class="module-checks">
            <label v-for="m in cleanModuleOptions" :key="m.value" class="module-item">
              <input type="checkbox" :value="m.value" v-model="cleanRuleForm.clean_module" />
              <span>{{ m.label }}</span>
            </label>
          </div>
        </div>
        <div v-if="cleanRuleMeta.update_time || cleanRuleMeta.operator" class="clean-rule-meta">
          <div>最近更新时间：{{ cleanRuleMeta.update_time || '-' }}</div>
          <div>最近操作人：{{ cleanRuleMeta.operator || '-' }}</div>
        </div>
      </div>
      <template #footer>
        <button class="btn btn-ghost" :disabled="isSavingCleanRule" @click="showCleanRule = false">取消</button>
        <button class="btn btn-primary" :disabled="isSavingCleanRule" @click="saveCleanRule">
          {{ isSavingCleanRule ? '保存中...' : '保存' }}
        </button>
      </template>
    </Modal>

    <Modal v-if="showLogSwitch" title="日志记录开关" @close="showLogSwitch = false">
      <div>
        <div class="rule-switch">
          <span>全局日志记录开关</span>
          <label class="switch-line">
            <input type="checkbox" v-model="logSwitchForm.enabled" />
            <span>{{ logSwitchForm.enabled ? '开启' : '关闭' }}</span>
          </label>
        </div>

        <div style="margin-top:12px">
          <label class="label">模块级开关（覆盖全局）</label>
          <div class="module-checks">
            <label v-for="m in logSwitchModules" :key="m.module" class="module-item">
              <input type="checkbox" v-model="m.enabled" />
              <span>{{ m.label }}</span>
            </label>
          </div>
        </div>

        <div v-if="logSwitchMeta.update_time" class="clean-rule-meta">
          <div>最近更新时间：{{ logSwitchMeta.update_time }}</div>
        </div>
      </div>
      <template #footer>
        <button class="btn btn-ghost" :disabled="isSavingLogSwitch" @click="showLogSwitch = false">取消</button>
        <button class="btn btn-primary" :disabled="isSavingLogSwitch" @click="saveLogSwitch">
          {{ isSavingLogSwitch ? '保存中...' : '保存' }}
        </button>
      </template>
    </Modal>

    <Modal v-if="showMaskRule" title="日志脱敏规则" @close="showMaskRule = false">
      <div>
        <div class="mask-filter-row">
          <div>
            <label class="label">模块筛选</label>
            <select class="input" v-model="maskRuleQuery.module">
              <option value="">全部</option>
              <option value="student">student</option>
              <option value="teacher">teacher</option>
              <option value="audit">audit</option>
            </select>
          </div>
          <div class="mask-query-btn">
            <button class="btn btn-primary" :disabled="maskRuleLoading" @click="fetchDesensitizationRules">
              {{ maskRuleLoading ? '查询中...' : '查询' }}
            </button>
          </div>
        </div>

        <table class="table" style="margin-top:12px">
          <thead>
            <tr>
              <th>规则id</th>
              <th>模块</th>
              <th>字段</th>
              <th>规则类型</th>
              <th>规则内容</th>
              <th>描述</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="maskRuleLoading">
              <td colspan="7">加载中...</td>
            </tr>
            <tr v-else-if="maskRuleError">
              <td colspan="7">{{ maskRuleError }}</td>
            </tr>
            <tr v-for="rule in maskRules" :key="rule.rule_id">
              <td>{{ rule.rule_id }}</td>
              <td>{{ rule.module }}</td>
              <td>{{ rule.field }}</td>
              <td>{{ rule.rule_type }}</td>
              <td>{{ rule.rule_content }}</td>
              <td>{{ rule.description }}</td>
              <td>
                <span :class="rule.enabled ? 'status-normal' : 'status-disabled'">
                  {{ rule.enabled ? '启用' : '停用' }}
                </span>
              </td>
            </tr>
            <tr v-if="!maskRuleLoading && !maskRuleError && maskRules.length === 0">
              <td colspan="7">暂无脱敏规则</td>
            </tr>
          </tbody>
        </table>
      </div>
      <template #footer>
        <button class="btn btn-ghost" @click="showMaskRule = false">关闭</button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Modal from '../../components/Modal.vue'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

const authRole = localStorage.getItem('auth_role') || ''
const isSuperAdmin = computed(() => authRole === 'super_admin' || authRole === 'admin')

const isLoading = ref(false)
const isExporting = ref(false)
const errorMessage = ref('')
const logs = ref([])

const pagination = ref({
  page: 1,
  size: 10,
  total: 0
})

const query = ref({
  operatorId: '',
  operatorType: '',
  module: '',
  type: '',
  result: '',
  startTime: '',
  endTime: ''
})

const appliedQuery = ref({ ...query.value })

const hasNextPage = computed(() => pagination.value.page * pagination.value.size < pagination.value.total)
const exportFields = [
  'log_id',
  'operator_id',
  'operator_type',
  'module',
  'type',
  'content',
  'result',
  'ip',
  'device',
  'execute_time'
]

function normalizeDateTime(value) {
  if (!value) return ''
  if (value.length === 16) return `${value.replace('T', ' ')}:00`
  return value.replace('T', ' ')
}

function buildQueryParams(page) {
  const q = appliedQuery.value
  const params = new URLSearchParams()

  params.set('page', String(page))
  params.set('size', String(pagination.value.size))

  if (q.operatorId) params.set('operatorId', q.operatorId)
  if (q.operatorType) params.set('operatorType', q.operatorType)
  if (q.module) params.set('module', q.module)
  if (q.type) params.set('type', q.type)
  if (q.result) params.set('result', q.result)
  if (q.startTime) params.set('startTime', normalizeDateTime(q.startTime))
  if (q.endTime) params.set('endTime', normalizeDateTime(q.endTime))

  return params.toString()
}

function buildExportQueryParams() {
  const q = appliedQuery.value
  const params = new URLSearchParams()
  if (q.operatorId) params.set('operatorId', q.operatorId)
  if (q.operatorType) params.set('operatorType', q.operatorType)
  if (q.module) params.set('module', q.module)
  if (q.type) params.set('type', q.type)
  if (q.result) params.set('result', q.result)
  if (q.startTime) params.set('startTime', normalizeDateTime(q.startTime))
  if (q.endTime) params.set('endTime', normalizeDateTime(q.endTime))
  exportFields.forEach((field) => params.append('exportFields', field))
  return params.toString()
}

function parseFileName(disposition) {
  if (!disposition) return ''
  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1])
  const quotedMatch = disposition.match(/filename=\"?([^\";]+)\"?/i)
  if (quotedMatch?.[1]) return quotedMatch[1]
  return ''
}

function getOperatorTypeText(type) {
  if (type === 'admin') return '管理员'
  if (type === 'teacher') return '教师'
  if (type === 'system') return '系统'
  return type || '-'
}

function normalizeResult(result) {
  const lowered = String(result || '').toLowerCase()
  return lowered === 'success' || lowered === 'ok' || lowered === 'true'
}

async function fetchOperationLogs(page = 1) {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const token = localStorage.getItem('auth_token') || ''
    const queryString = buildQueryParams(page)
    const url = `${API_BASE}/logs/operations?${queryString}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: token } : {})
      }
    })

    const payload = await response.json().catch(() => null)

    if (!response.ok || !payload) {
      throw new Error(payload?.message || '查询日志失败，请稍后重试')
    }

    if (payload.code !== 200) {
      throw new Error(payload.message || '查询日志失败，请稍后重试')
    }

    const list = Array.isArray(payload.data?.log_list) ? payload.data.log_list : []
    const pager = payload.data?.pagination || {}

    logs.value = list
      .map((item) => ({
        id: item.log_id,
        operatorId: item.operator_id,
        operatorType: item.operator_type || '',
        operatorTypeText: getOperatorTypeText(item.operator_type),
        module: item.module || '-',
        type: item.type || '-',
        result: item.result || '',
        success: normalizeResult(item.result),
        operationTime: item.execute_time || '-',
        ip: item.ip || '-',
        device: item.device || '-',
        detail: item.content || '无内容'
      }))
      .sort((a, b) => new Date(b.operationTime).getTime() - new Date(a.operationTime).getTime())

    pagination.value = {
      page: Number(pager.page || page),
      size: Number(pager.size || pagination.value.size || 10),
      total: Number(pager.total || list.length)
    }
  } catch (error) {
    logs.value = []
    errorMessage.value = error?.message || '查询失败'
  } finally {
    isLoading.value = false
  }
}

function doQuery() {
  appliedQuery.value = { ...query.value }
  fetchOperationLogs(1)
}

function resetQuery() {
  query.value = {
    operatorId: '',
    operatorType: '',
    module: '',
    type: '',
    result: '',
    startTime: '',
    endTime: ''
  }
  appliedQuery.value = { ...query.value }
  fetchOperationLogs(1)
}

function changePage(page) {
  fetchOperationLogs(page)
}

async function exportLogs() {
  if (!isSuperAdmin.value) {
    alert('无权限导出审计日志')
    return
  }
  isExporting.value = true
  try {
    const token = localStorage.getItem('auth_token') || ''
    const queryString = buildExportQueryParams()
    const url = `${API_BASE}/logs/operations/export${queryString ? `?${queryString}` : ''}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: token } : {})
      }
    })

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => null)
      throw new Error(errorPayload?.message || '导出日志失败，请稍后重试')
    }

    const blob = await response.blob()
    const disposition = response.headers.get('content-disposition') || ''
    const fileName = parseFileName(disposition) || `操作日志_${Date.now()}.xlsx`

    const downloadUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = fileName
    a.click()
    URL.revokeObjectURL(downloadUrl)
  } catch (error) {
    alert(error?.message || '导出日志失败')
  } finally {
    isExporting.value = false
  }
}

const showLogDetail = ref(false)
const currentLog = ref(null)

function viewLog(log) {
  currentLog.value = {
    ...log,
    detail: `内容：${log.detail}\nIP：${log.ip}\n设备：${log.device}\n结果：${log.success ? '成功' : '失败'}`
  }
  showLogDetail.value = true
}

const showCleanHistory = ref(false)
const cleanHistory = ref([])
const historyLoading = ref(false)
const historyError = ref('')
const historyPagination = ref({
  page: 1,
  size: 10,
  total: 0,
  total_pages: 1
})

const historyQuery = ref({
  startTime: '',
  endTime: '',
  status: ''
})
const appliedHistoryQuery = ref({ ...historyQuery.value })

const filteredHistory = computed(() => cleanHistory.value)
const historyHasNextPage = computed(() => historyPagination.value.page < historyPagination.value.total_pages)

function getHistoryStatusText(status) {
  const lowered = String(status || '').toLowerCase()
  if (lowered === 'success') return '成功'
  if (lowered === 'fail' || lowered === 'failed') return '失败'
  return status || '-'
}

function getHistoryOperatorText(operator) {
  if (operator === 'system') return 'system（系统自动）'
  if (operator === 'admin') return 'admin（人工触发）'
  return operator || '-'
}

async function fetchCleanHistory(page = 1) {
  historyLoading.value = true
  historyError.value = ''
  try {
    const token = localStorage.getItem('auth_token') || ''
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('size', String(historyPagination.value.size))
    if (appliedHistoryQuery.value.startTime) params.set('startTime', normalizeDateTime(appliedHistoryQuery.value.startTime))
    if (appliedHistoryQuery.value.endTime) params.set('endTime', normalizeDateTime(appliedHistoryQuery.value.endTime))
    if (appliedHistoryQuery.value.status) params.set('status', appliedHistoryQuery.value.status)

    const url = `${API_BASE}/logs/clean-records?${params.toString()}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: token } : {})
      }
    })
    const payload = await response.json().catch(() => null)

    if (!response.ok || !payload) {
      throw new Error(payload?.message || '查询日志清理历史记录失败，请稍后重试')
    }
    if (payload.code !== 200) {
      throw new Error(payload.message || '查询日志清理历史记录失败，请稍后重试')
    }

    const data = payload.data || {}
    const list = Array.isArray(data.record_list) ? data.record_list : []
    cleanHistory.value = list.map((item) => ({
      id: item.record_id,
      status: getHistoryStatusText(item.status),
      cleanTime: item.clean_time || '-',
      cleanedCount: Number(item.cleaned_count || 0),
      cleanModuleText: Array.isArray(item.clean_module) ? item.clean_module.join(', ') : '-',
      operatorId: getHistoryOperatorText(item.operator),
      reason: item.remark || '-'
    }))

    historyPagination.value = {
      page: Number(data.pagination?.page || page),
      size: Number(data.pagination?.size || historyPagination.value.size || 10),
      total: Number(data.pagination?.total || list.length),
      total_pages: Number(data.pagination?.total_pages || 1)
    }
  } catch (error) {
    cleanHistory.value = []
    historyError.value = error?.message || '查询失败'
  } finally {
    historyLoading.value = false
  }
}

function openHistory() {
  showCleanHistory.value = true
  fetchCleanHistory(1)
}

function queryHistory() {
  appliedHistoryQuery.value = { ...historyQuery.value }
  fetchCleanHistory(1)
}

function changeHistoryPage(page) {
  fetchCleanHistory(page)
}

const showCleanRule = ref(false)
const isSavingCleanRule = ref(false)
const cleanModuleOptions = [
  { value: 'all', label: '全部' },
  { value: 'student', label: '学生模块' },
  { value: 'teacher', label: '教师模块' },
  { value: 'audit', label: '审计模块' }
]
const cleanRuleForm = ref({
  retention_days: 180,
  clean_cron: '0 0 3 * * ?',
  enabled: true,
  clean_module: ['all']
})
const cleanRuleMeta = ref({
  update_time: '',
  operator: ''
})

const showLogSwitch = ref(false)
const isSavingLogSwitch = ref(false)
const logSwitchForm = ref({
  enabled: true
})
const logSwitchModules = ref([
  { module: 'student', label: '学生模块', enabled: true },
  { module: 'teacher', label: '教师模块', enabled: true },
  { module: 'audit', label: '审计模块', enabled: true }
])
const logSwitchMeta = ref({
  update_time: ''
})

function openCleanRule() {
  showCleanRule.value = true
}

async function saveCleanRule() {
  if (!isSuperAdmin.value) {
    alert('仅超级管理员可配置日志自动清理规则')
    return
  }
  if (!cleanRuleForm.value.retention_days || cleanRuleForm.value.retention_days < 1) {
    alert('日志保留天数必须大于 0')
    return
  }
  if (!cleanRuleForm.value.clean_cron) {
    alert('请填写定时清理表达式')
    return
  }
  if (!cleanRuleForm.value.clean_module.length) {
    alert('请至少选择一个清理模块')
    return
  }

  isSavingCleanRule.value = true
  try {
    const token = localStorage.getItem('auth_token') || ''
    const url = `${API_BASE}/logs/clean-config`
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: token } : {})
      },
      body: JSON.stringify({
        retention_days: Number(cleanRuleForm.value.retention_days),
        clean_cron: cleanRuleForm.value.clean_cron,
        enabled: !!cleanRuleForm.value.enabled,
        clean_module: cleanRuleForm.value.clean_module
      })
    })

    const payload = await response.json().catch(() => null)
    if (!response.ok || !payload) {
      throw new Error(payload?.message || '保存日志自动清理规则失败，请稍后重试')
    }
    if (payload.code !== 200) {
      throw new Error(payload.message || '保存日志自动清理规则失败，请稍后重试')
    }

    const data = payload.data || {}
    cleanRuleForm.value = {
      retention_days: Number(data.retention_days || cleanRuleForm.value.retention_days),
      clean_cron: data.clean_cron || cleanRuleForm.value.clean_cron,
      enabled: typeof data.enabled === 'boolean' ? data.enabled : cleanRuleForm.value.enabled,
      clean_module: Array.isArray(data.clean_module) && data.clean_module.length ? data.clean_module : cleanRuleForm.value.clean_module
    }
    cleanRuleMeta.value = {
      update_time: data.update_time || '',
      operator: data.operator || ''
    }
    alert(payload.message || '更新日志清理配置成功')
    showCleanRule.value = false
  } catch (error) {
    alert(error?.message || '保存失败')
  } finally {
    isSavingCleanRule.value = false
  }
}

function openLogSwitch() {
  showLogSwitch.value = true
}

async function saveLogSwitch() {
  if (!isSuperAdmin.value) {
    alert('仅超级管理员可设置日志记录开关')
    return
  }

  isSavingLogSwitch.value = true
  try {
    const token = localStorage.getItem('auth_token') || ''
    const url = `${API_BASE}/logs/switch`
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: token } : {})
      },
      body: JSON.stringify({
        enabled: !!logSwitchForm.value.enabled,
        module_switches: logSwitchModules.value.map((item) => ({
          module: item.module,
          enabled: !!item.enabled
        }))
      })
    })

    const payload = await response.json().catch(() => null)
    if (!response.ok || !payload) {
      throw new Error(payload?.message || '保存日志记录开关失败，请稍后重试')
    }
    if (payload.code !== 200) {
      throw new Error(payload.message || '保存日志记录开关失败，请稍后重试')
    }

    const data = payload.data || {}
    logSwitchForm.value.enabled = typeof data.global_enabled === 'boolean' ? data.global_enabled : logSwitchForm.value.enabled
    if (Array.isArray(data.module_switches)) {
      const moduleMap = new Map(data.module_switches.map((x) => [x.module, !!x.enabled]))
      logSwitchModules.value = logSwitchModules.value.map((item) => ({
        ...item,
        enabled: moduleMap.has(item.module) ? moduleMap.get(item.module) : item.enabled
      }))
    }
    logSwitchMeta.value.update_time = data.update_time || ''

    alert(payload.message || '更新日志记录开关成功')
    showLogSwitch.value = false
  } catch (error) {
    alert(error?.message || '保存失败')
  } finally {
    isSavingLogSwitch.value = false
  }
}

const showMaskRule = ref(false)
const maskRuleLoading = ref(false)
const maskRuleError = ref('')
const maskRules = ref([])
const maskRuleQuery = ref({
  module: ''
})

async function fetchDesensitizationRules() {
  if (!isSuperAdmin.value) {
    maskRuleError.value = '仅超级管理员可查看日志脱敏规则'
    maskRules.value = []
    return
  }

  maskRuleLoading.value = true
  maskRuleError.value = ''
  try {
    const token = localStorage.getItem('auth_token') || ''
    const params = new URLSearchParams()
    if (maskRuleQuery.value.module) params.set('module', maskRuleQuery.value.module)

    const url = `${API_BASE}/logs/desensitization-rules${params.toString() ? `?${params.toString()}` : ''}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: token } : {})
      }
    })
    const payload = await response.json().catch(() => null)

    if (!response.ok || !payload) {
      throw new Error(payload?.message || '查询日志脱敏规则失败，请稍后重试')
    }
    if (payload.code !== 200) {
      throw new Error(payload.message || '查询日志脱敏规则失败，请稍后重试')
    }

    maskRules.value = Array.isArray(payload.data) ? payload.data : []
  } catch (error) {
    maskRules.value = []
    maskRuleError.value = error?.message || '查询失败'
  } finally {
    maskRuleLoading.value = false
  }
}

function openMaskRule() {
  showMaskRule.value = true
  fetchDesensitizationRules()
}

onMounted(() => {
  fetchOperationLogs(1)
})
</script>

<style scoped>
.query-panel {
  padding: 14px;
  border: 1px solid var(--surface-border);
  border-radius: 10px;
  background: #fbfffd;
}

.query-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(160px, 1fr));
  gap: 12px;
}

.query-actions {
  display: flex;
  align-items: end;
  gap: 10px;
}

.tip-text {
  color: var(--muted);
  font-size: 13px;
}

.detail-block {
  white-space: pre-wrap;
  max-height: 320px;
  overflow: auto;
}

.pager-row {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.pager-left {
  color: var(--muted);
  font-size: 13px;
}

.pager-right {
  display: flex;
  gap: 8px;
}

.history-filters {
  display: grid;
  grid-template-columns: repeat(4, minmax(120px, 1fr));
  gap: 10px;
  margin-bottom: 12px;
}

.history-query-btn {
  display: flex;
  align-items: end;
}

.history-table {
  max-height: 340px;
  overflow: auto;
}

.rule-list {
  margin: 0;
  padding-left: 18px;
  color: var(--text);
}

.rule-list li {
  margin-bottom: 8px;
}

.clean-rule-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(160px, 1fr));
  gap: 12px;
}

.rule-switch {
  margin-top: 12px;
  padding: 10px;
  border-radius: 10px;
  background: #f7fbf9;
  border: 1px solid var(--surface-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.switch-line {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.module-checks {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 14px;
}

.module-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.mask-filter-row {
  display: grid;
  grid-template-columns: minmax(220px, 320px) auto;
  gap: 10px;
  align-items: end;
}

.mask-query-btn {
  display: flex;
  align-items: end;
}

.clean-rule-meta {
  margin-top: 12px;
  padding: 10px;
  border-radius: 10px;
  background: #f7fbf9;
  border: 1px solid var(--surface-border);
  color: var(--muted);
  font-size: 13px;
  display: grid;
  gap: 4px;
}

.btn-disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

@media (max-width: 980px) {
  .query-grid {
    grid-template-columns: 1fr;
  }

  .history-filters {
    grid-template-columns: 1fr;
  }

  .clean-rule-grid {
    grid-template-columns: 1fr;
  }

  .mask-filter-row {
    grid-template-columns: 1fr;
  }

  .pager-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
