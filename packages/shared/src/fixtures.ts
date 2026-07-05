import type { ResumeDocument } from './resume'

export const demoResume: ResumeDocument = {
  id: 'demo-resume',
  locale: 'zh-CN',
  profile: {
    name: 'Lin Yinuo',
    headline: 'AI Product Manager / Prototype Engineer',
    email: 'lin@example.com',
    location: 'Shanghai',
  },
  modules: [
    {
      id: 'module-avatar',
      type: 'avatar',
      title: 'Basic Info',
      order: 1,
      content: {
        name: 'Lin Yinuo',
        headline: 'AI Product Manager / Prototype Engineer',
        email: 'lin@example.com',
        phone: '+86 138 0000 0000',
        location: 'Shanghai',
        avatarUrl: '',
      },
    },
    {
      id: 'module-summary',
      type: 'summary',
      title: 'Summary',
      order: 2,
      content: {
        text: '6 years of AI product and growth tooling experience, focused on turning LLM capabilities into measurable workflows.',
      },
    },
    {
      id: 'module-experience',
      type: 'experience',
      title: 'Experience',
      order: 3,
      content: {
        items: [
          {
            id: 'experience-ai-resume',
            company: 'AIResumeCraft',
            role: 'Product Lead',
            startDate: '2024',
            endDate: 'Present',
            description:
              'Led an AI resume diagnostics workflow and split generation into scoring, suggestions, rewriting, and review stages.',
          },
        ],
      },
    },
    {
      id: 'module-skills',
      type: 'skills',
      title: 'Skills',
      order: 4,
      content: {
        skills: [
          'Vue',
          'Nuxt',
          'TypeScript',
          'Prompt Engineering',
          'Growth Analytics',
        ],
      },
    },
  ],
  sections: [
    {
      id: 'section-summary',
      type: 'summary',
      title: 'Summary',
      markdown:
        '6 years of AI product and growth tooling experience, focused on turning LLM capabilities into measurable workflows.',
      order: 1,
    },
    {
      id: 'section-experience',
      type: 'experience',
      title: 'Experience',
      markdown:
        '- Led an AI resume diagnostics workflow.\n- Split generation into scoring, suggestions, rewriting, and review stages.',
      order: 2,
    },
    {
      id: 'section-skills',
      type: 'skills',
      title: 'Skills',
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
