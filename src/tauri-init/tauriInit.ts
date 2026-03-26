import { createTrayMenu } from '@/tray-menu'
import { log_error } from '@/invoke-apis/file-log.ts'

export function tauriInit() {
  Promise.resolve()
    .then(async () => {
      await createTrayMenu()
    })
    .catch((e: any) => {
      console.error(e)
      log_error(`tauriInit: ${e?.message || e}`)
    })
}
