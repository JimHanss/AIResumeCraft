import type { ResumeGenerationRequest } from '@airesumecraft/shared'
import { apiRoutes } from '@airesumecraft/shared'
import { ref } from 'vue'

export function useAIStream() {
  const content = ref('')
  const error = ref<Error>()
  const isStreaming = ref(false)
  let controller: AbortController | undefined

  async function stream(payload: ResumeGenerationRequest) {
    controller?.abort()
    controller = new AbortController()
    content.value = ''
    error.value = undefined
    isStreaming.value = true

    try {
      const response = await fetch(apiRoutes.aiResume, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })

      if (!response.ok)
        throw new Error(`AI request failed with status ${response.status}`)

      if (!response.body) {
        content.value = await response.text()
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done)
          break
        content.value += decoder.decode(value, { stream: true })
      }
    }
    catch (caught) {
      if ((caught as Error).name !== 'AbortError')
        error.value = caught as Error
    }
    finally {
      isStreaming.value = false
    }
  }

  function abort() {
    controller?.abort()
  }

  return {
    abort,
    content,
    error,
    isStreaming,
    stream,
  }
}
