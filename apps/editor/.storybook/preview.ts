import type { Preview } from '@storybook/vue3'
import { setup } from '@storybook/vue3'
import naive from 'naive-ui'

setup((app) => {
  app.use(naive)
})

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
