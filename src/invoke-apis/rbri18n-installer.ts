import { invokeWrapper } from '@/utils/invokeWrapper.ts'

export const checkRBRi18nInstallStatusApi = (rbrInstallPath: string) => {
  return invokeWrapper<string>('check_rbri18n_install_status', {
    rbrInstallPath,
  })
}

// install_rbri18n
export const installRBRi18nApi = (rbrInstallPath: string, zipFileUrl: string) => {
  return invokeWrapper<string>('install_rbri18n', {
    rbrInstallPath,
    zipFileUrl,
  })
}
