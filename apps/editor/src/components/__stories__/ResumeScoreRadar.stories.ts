import type { Meta, StoryObj } from '@storybook/vue3'
import ResumeScoreRadar from '../ResumeScoreRadar.vue'

const meta = {
  title: 'Editor/ResumeScoreRadar',
  component: ResumeScoreRadar,
  tags: ['autodocs'],
  args: {
    score: {
      impact: 86,
      clarity: 78,
      relevance: 82,
      ats: 74,
    },
  },
} satisfies Meta<typeof ResumeScoreRadar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
