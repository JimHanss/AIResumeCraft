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
        profileUrl: 'https://www.airesumecraft.dev',
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
      id: 'module-education',
      type: 'education',
      title: 'Education',
      order: 3,
      content: {
        items: [
          {
            id: 'education-fudan',
            school: 'Fudan University',
            degree: 'Bachelor of Management',
            field: 'Information Management',
            location: 'Shanghai',
            startDate: '2016',
            endDate: '2020',
            gpa: '3.7/4.0',
            honors: 'Outstanding Graduate',
            coursework:
              'Data Structures, Product Analytics, Human-Computer Interaction',
            description:
              'Led campus innovation projects and built early product prototypes for student services.',
          },
        ],
      },
    },
    {
      id: 'module-experience',
      type: 'experience',
      title: 'Experience',
      order: 4,
      content: {
        items: [
          {
            id: 'experience-ai-resume',
            company: 'AIResumeCraft',
            role: 'Product Lead',
            location: 'Shanghai',
            startDate: '2024',
            endDate: '',
            current: true,
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
      order: 5,
      content: {
        groups: [
          {
            id: 'skill-group-frontend',
            name: 'Frontend',
            skills: ['Vue', 'Nuxt', 'TypeScript'],
          },
          {
            id: 'skill-group-ai-product',
            name: 'AI/Product',
            skills: ['Prompt Engineering', 'Growth Analytics'],
          },
          {
            id: 'skill-group-tools',
            name: 'Tools',
            skills: ['Figma', 'Git', 'A/B Testing'],
          },
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
      id: 'section-education',
      type: 'education',
      title: 'Education',
      markdown:
        'Fudan University, Bachelor of Management in Information Management, 2016 - 2020.',
      order: 2,
    },
    {
      id: 'section-experience',
      type: 'experience',
      title: 'Experience',
      markdown:
        '- Led an AI resume diagnostics workflow.\n- Split generation into scoring, suggestions, rewriting, and review stages.',
      order: 3,
    },
    {
      id: 'section-skills',
      type: 'skills',
      title: 'Skills',
      markdown: 'Vue, Nuxt, TypeScript, Prompt Engineering, Growth Analytics',
      order: 4,
    },
  ],
  score: {
    impact: 86,
    clarity: 78,
    relevance: 82,
    ats: 74,
  },
}
