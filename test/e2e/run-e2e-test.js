const http = require('http')
const { resolve } = require('path')

require('dotenv').config({ path: 'variables.env' })

const cypress = require('cypress')
const app = require('../../app')

const TEST_PORT = 3007

app.set('port', TEST_PORT)

const server = http.createServer(app)

const { CONTENTFUL_SPACE_ID, CONTENTFUL_DELIVERY_TOKEN, CONTENTFUL_PREVIEW_TOKEN } = process.env

server.on('error', console.error)
server.listen(TEST_PORT, function () {
  cypress.run({
    spec: resolve(__dirname, 'specs', 'the-example-app-spec.js'),
    headed: !process.env.CI,
    env: {
      CONTENTFUL_SPACE_ID, CONTENTFUL_DELIVERY_TOKEN, CONTENTFUL_PREVIEW_TOKEN
    }
  })
    .then(() => {
      server.close()
      process.exit(0)
    }).catch(() => {
      server.close()
      process.exit(1)
    })
})
