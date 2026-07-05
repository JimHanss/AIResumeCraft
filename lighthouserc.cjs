module.exports = {
  ci: {
    collect: {
      startServerCommand: 'yarn workspace @airesumecraft/portfolio preview',
      url: ['http://localhost:3000'],
      numberOfRuns: 1,
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.85 }],
        'categories:accessibility': ['warn', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
      },
    },
  },
}
