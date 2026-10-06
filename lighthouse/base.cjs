const PORT = 4173
const urls = [`http://localhost:${PORT}/`, `http://localhost:${PORT}/nfts/emerald-ape-042`]

function createConfig(profile) {
  return {
    ci: {
      collect: {
        startServerCommand: `npm run preview -- --port ${PORT}`,
        startServerReadyPattern: 'Local',
        url: urls,
        numberOfRuns: 3,
        settings: {
          ...(profile === 'desktop' ? { preset: 'desktop' } : {}),
          chromeFlags: '--headless=new --no-sandbox',
        },
      },
      assert: {
        assertions: {
          'categories:performance': ['warn', { minScore: 0.9, aggregationMethod: 'median' }],
          'categories:accessibility': ['warn', { minScore: 0.95, aggregationMethod: 'median' }],
          'categories:best-practices': ['warn', { minScore: 0.95, aggregationMethod: 'median' }],
          'categories:seo': ['warn', { minScore: 0.9, aggregationMethod: 'median' }],
        },
      },
      upload: {
        target: 'filesystem',
        outputDir: `./lighthouse/reports/${profile}`,
      },
    },
  }
}

module.exports = { createConfig }
