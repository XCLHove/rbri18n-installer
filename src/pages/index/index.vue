<script setup lang="ts">
import axios from 'axios'
import { computed, onMounted, ref, watch } from 'vue'
import { Asset, GithubReleaseInfo } from '@/pages/index/type.ts'
import { loadingStart } from '@/utils/LoadingUtils.ts'
import { log_error } from '@/invoke-apis/file-log.ts'
import { dayjs, ElMessage, ElMessageBox } from 'element-plus'
import { localStorageRef } from '@/utils/VueUtils.ts'
import { checkRBRi18nInstallStatusApi, installRBRi18nApi } from '@/invoke-apis/rbri18n-installer.ts'
import { writeText } from '@tauri-apps/plugin-clipboard-manager'
import { open } from '@tauri-apps/plugin-dialog'
import { Refresh } from '@element-plus/icons-vue'

const user = 'geekerlw'
const repo = 'RBRi18n'
const rbrInstallPath = localStorageRef('rbrInstallPath', '')
const githubReleaseInfoList = ref<GithubReleaseInfo[]>([])
const currentReleaseInfo = ref<GithubReleaseInfo | null>(null)
const latestReleaseInfo = ref<GithubReleaseInfo | null>(null)
const currentReleaseAsserts = computed(() => currentReleaseInfo.value?.assets || [])
const installStatus = ref<'安装目录不正确' | '已安装' | '未安装' | '未知'>('未知')

watch(
  () => githubReleaseInfoList.value,
  () => {
    currentReleaseInfo.value = githubReleaseInfoList.value[0] ?? null
  },
)

watch(
  () => rbrInstallPath.value,
  () => checkRBRi18nInstallStatus(),
)

const getGithubReleaseList = () => {
  const loadingEnd = loadingStart('获取插件信息...')
  axios
    .get<GithubReleaseInfo[]>(`https://api.github.com/repos/${user}/${repo}/releases`)
    .then((r) => {
      githubReleaseInfoList.value = r.data
    })
    .catch((e) => {
      const errorMessage = e?.message || e?.toString()
      log_error(errorMessage)
      ElMessage.error(`获取插件信息出错：${errorMessage}`)
    })
    .finally(() => loadingEnd())
}

const getLatestReleaseInfo = () => {
  const loadingEnd = loadingStart('获取插件最新版本信息...')
  axios
    .get<GithubReleaseInfo>(`https://api.github.com/repos/${user}/${repo}/releases/latest`)
    .then((r) => {
      latestReleaseInfo.value = r.data
    })
    .catch((e) => {
      const errorMessage = e?.message || e?.toString()
      log_error(errorMessage)
      ElMessage.error(`获取插件最新版本信息出错：${errorMessage}`)
    })
    .finally(() => loadingEnd())
}

const dateFormat = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

const checkRBRi18nInstallStatus = () => {
  const loadingEnd = loadingStart('获取插件安装状态...')
  checkRBRi18nInstallStatusApi(rbrInstallPath.value)
    .then((r) => {
      installStatus.value = r as any
    })
    .finally(() => loadingEnd())
}

const installRBRi18n = async (asset: Asset) => {
  if (installStatus.value === '安装目录不正确' || installStatus.value === '未知') {
    ElMessage.warning('请先选择正确的 RBR 安装路径！')
    return
  }

  if (installStatus.value === '已安装') {
    const confirm = await ElMessageBox.confirm('是否重新安装？', '提示')
      .then(() => true)
      .catch(() => false)
    if (!confirm) return
  }

  const loadingEnd = loadingStart('正在安装...')
  installRBRi18nApi(rbrInstallPath.value, asset.browser_download_url)
    .then((r) => {
      checkRBRi18nInstallStatus()
      ElMessage.success('安装成功！')
    })
    .catch((e) => {
      ElMessage.error(`安装失败：${e?.message || e?.toString()}`)
    })
    .finally(() => loadingEnd())
}

const copyDownloadUrl = (asset: Asset) => {
  writeText(asset.browser_download_url)
    .then(() => {
      ElMessage.success('已复制下载链接到剪贴板！')
    })
    .catch((e) => {
      const errMsg = e?.message || e?.toString()
      log_error(errMsg)
      ElMessage.error(`复制下载链接到剪贴板出错：${errMsg}`)
    })
}

const selectRBRInstallPath = () => {
  open({
    directory: true,
    defaultPath: rbrInstallPath.value,
  })
    .then((path) => {
      rbrInstallPath.value = path || ''
    })
    .catch(() => {})
}

const getRBRi18nInfo = () => {
  getLatestReleaseInfo()
  getGithubReleaseList()
}

onMounted(() => {
  checkRBRi18nInstallStatus()
  getLatestReleaseInfo()
  getGithubReleaseList()
})
</script>

<template>
  <div class="home-page w-full h-full flex flex-col">
    <div class="flex flex-row mt-1 pl-1 pr-1">
      <el-text class="text-nowrap">RBR 安装路径：</el-text>
      <el-input type="textarea" :rows="1" placeholder="请选择 RBR 安装路径" v-model="rbrInstallPath"> </el-input>
      <el-button type="primary" @click="selectRBRInstallPath">选择</el-button>
    </div>
    <div class="flex flex-row items-center mt-1">
      <div>
        <el-tag
          class="text-nowrap"
          size="large"
          :type="
            installStatus === '已安装' ? 'success' : installStatus === '安装目录不正确' ? 'danger' : installStatus === '未安装' ? 'warning' : 'info'
          "
        >
          <span style="width: 100px">{{ installStatus }}</span>
        </el-tag>
      </div>
      <el-select v-model="currentReleaseInfo" placeholder="请选择版本" value-key="id">
        <el-option v-for="item in githubReleaseInfoList" :key="item.id" :label="item.name" :value="item">
          {{ item.name }}{{ item.id === latestReleaseInfo?.id ? '(最新)' : '' }}({{ dateFormat(item.updated_at) }})
        </el-option>

        <template #prefix>版本</template>
      </el-select>
      <el-button type="primary" :icon="Refresh" @click="getRBRi18nInfo">重新获取插件信息</el-button>
    </div>
    <el-table class="mt-1" :data="currentReleaseAsserts" border show-overflow-tooltip default-expand-all>
      <el-table-column type="expand">
        <template #default="{ row }">
          <el-button link type="primary" @click="copyDownloadUrl(row)">{{ row.browser_download_url }}</el-button>
        </template>
      </el-table-column>
      <el-table-column label="文件名称" prop="name"></el-table-column>
      <el-table-column label="上传时间" prop="updated_at" width="200">
        <template #default="{ row }">
          {{ dateFormat(row.updated_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="100" fixed="right">
        <template #default="{ row }">
          <div class="flex justify-center">
            <el-button type="primary" @click="installRBRi18n(row)">安装</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped lang="scss">
.home-page {
}
</style>
