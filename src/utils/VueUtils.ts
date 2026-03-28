import { ref, watch } from 'vue'

export const localStorageRef = <T>(key: string, defaultValue?: T) => {
  const getCache = () => {
    const cacheStr = localStorage.getItem(key)
    if (!cacheStr) return null
    try {
      return JSON.parse(cacheStr).value as T
    } catch (e) {
      return null
    }
  }
  const setCache = (value: T) => {
    localStorage.setItem(
      key,
      JSON.stringify(
        {
          value: value,
          updateTime: Date.now(),
        },
        null,
        4,
      ),
    )
  }

  const refValue = ref<T>((getCache() ?? defaultValue) as T)

  watch(
    () => refValue.value,
    (v) => setCache(v),
  )

  return refValue
}

export const sessionStorageRef = <T>(key: string, defaultValue?: T) => {
  const getCache = () => {
    const cacheStr = sessionStorage.getItem(key)
    if (!cacheStr) return null
    try {
      return JSON.parse(cacheStr).value as T
    } catch (e) {
      return null
    }
  }
  const setCache = (value: T) => {
    sessionStorage.setItem(
      key,
      JSON.stringify(
        {
          value: value,
          updateTime: Date.now(),
        },
        null,
        4,
      ),
    )
  }

  const refValue = ref<T>((getCache() ?? defaultValue) as T)

  watch(
    () => refValue.value,
    (v) => setCache(v),
  )

  return refValue
}
