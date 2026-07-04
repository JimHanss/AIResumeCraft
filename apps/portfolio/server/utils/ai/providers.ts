import type {
  AIProviderName,
  ResumeGenerationRequest,
  ResumeGenerationResponse,
} from '@airesumecraft/shared'
import process from 'node:process'

interface ProviderConfig {
  apiKey: string
  baseURL: string
  model: string
}

const providers: Record<Exclude<AIProviderName, 'mock'>, ProviderConfig> = {
  openai: {
    apiKey: process.env.NUXT_OPENAI_API_KEY ?? '',
    baseURL: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o',
  },
  deepseek: {
    apiKey: process.env.NUXT_DEEPSEEK_API_KEY ?? '',
    baseURL: 'https://api.deepseek.com/chat/completions',
    model: 'deepseek-chat',
  },
  moonshot: {
    apiKey: process.env.NUXT_MOONSHOT_API_KEY ?? '',
    baseURL: 'https://api.moonshot.cn/v1/chat/completions',
    model: 'moonshot-v1-8k',
  },
}

export async function createResumeDraft(
  payload: ResumeGenerationRequest,
): Promise<ResumeGenerationResponse> {
  if (payload.provider === 'mock') return createMockDraft(payload)

  const config = providers[payload.provider]
  if (!config.apiKey) return createMockDraft(payload)

  const response = await fetch(config.baseURL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'Return JSON only. Create a strongly structured resume improvement response.',
        },
        {
          role: 'user',
          content: JSON.stringify(payload),
        },
      ],
    }),
  })

  if (!response.ok)
    throw createError({
      statusCode: response.status,
      statusMessage: 'AI provider request failed',
    })

  const result = await response.json()
  const content = result.choices?.[0]?.message?.content
  if (!content)
    throw createError({
      statusCode: 502,
      statusMessage: 'AI provider returned an empty response',
    })

  return JSON.parse(content) as ResumeGenerationResponse
}

function createMockDraft(
  payload: ResumeGenerationRequest,
): ResumeGenerationResponse {
  const isEnglish = payload.language === 'en-US'

  return {
    summary: isEnglish
      ? `Position the resume around measurable ${payload.targetRole} outcomes.`
      : `围绕可量化的 ${payload.targetRole} 成果重组简历表达。`,
    highlights: isEnglish
      ? [
          'Lead with quantified impact',
          'Keep every bullet action-oriented',
          'Mirror target role keywords',
        ]
      : ['优先呈现量化结果', '每条经历使用动作导向表达', '补齐目标岗位关键词'],
    sections: [
      {
        title: isEnglish ? 'Rewritten summary' : '改写摘要',
        markdown: payload.sourceMarkdown ?? '',
      },
    ],
    score: {
      impact: 86,
      clarity: 82,
      relevance: 84,
      ats: 78,
    },
  }
}
