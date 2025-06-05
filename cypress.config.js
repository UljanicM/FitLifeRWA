// cypress.config.js
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:9000', // Tvoja frontend adresa
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
})