import type { ResumeDocument } from './resume'

export const demoResume: ResumeDocument = {
  id: 'demo-resume',
  locale: 'zh-CN',
  profile: {
    name: '林一诺',
    headline: 'AI 产品经理 / 全栈原型工程师',
    email: 'lin@example.com',
    location: 'Shanghai',
  },
  sections: [
    {
      id: 'section-summary',
      type: 'summary',
      title: '职业摘要',
      markdown:
        '6 年 AI 产品与增长工具经验，擅长把 LLM 能力落到可验证的业务流程中。',
      order: 1,
    },
    {
      id: 'section-experience',
      type: 'experience',
      title: '核心经历',
      markdown:
        '- 主导 AI 简历诊断系统，首月完成 18k 份简历分析。\n- 将生成式改写流程拆分为评分、建议、重写、复核四个阶段。',
      order: 2,
    },
    {
      id: 'section-skills',
      type: 'skills',
      title: '技能',
      markdown: 'Vue, Nuxt, TypeScript, Prompt Engineering, Growth Analytics',
      order: 3,
    },
  ],
  score: {
    impact: 86,
    clarity: 78,
    relevance: 82,
    ats: 74,
  },
}
