import { createI18n } from 'vue-i18n'

export const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': {
      app: {
        subtitle: '智能简历编辑器',
        dark: '深色',
        light: '浅色',
      },
      editor: {
        abort: '停止',
        aiImprove: 'AI 优化',
        editor: '编辑器',
        overall: '综合',
        score: '评分',
        sections: '模块',
      },
    },
    'en-US': {
      app: {
        subtitle: 'AI resume editor',
        dark: 'Dark',
        light: 'Light',
      },
      editor: {
        abort: 'Abort',
        aiImprove: 'Improve with AI',
        editor: 'Editor',
        overall: 'Overall',
        score: 'Score',
        sections: 'Sections',
      },
    },
  },
})
