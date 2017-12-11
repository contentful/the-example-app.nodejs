const http = require('http')
const { resolve } = require('path')
const execa = require('execa')

require('dotenv').config({ path: 'variables.env' })

const app = require('../app')

const TEST_PORT = 3007

app.set('port', TEST_PORT)

const server = http.createServer(app)

const { CONTENTFUL_SPACE_ID, CONTENTFUL_DELIVERY_TOKEN, CONTENTFUL_PREVIEW_TOKEN } = process.env

server.on('error', console.error)
server.listen(TEST_PORT, function () {
  const cypressBin = resolve(__dirname, 'e2e', 'node_modules', '.bin', 'cypress')
  const spec = resolve(__dirname, 'e2e', 'specs', 'the-example-app-spec.js')
  execa(cypressBin, [
    'run',
    '--spec',
    spec,
    !process.env.CI ? '--headed' : null,
    '--env',
    `CONTENTFUL_SPACE_ID=${CONTENTFUL_SPACE_ID},CONTENTFUL_DELIVERY_TOKEN=${CONTENTFUL_DELIVERY_TOKEN},CONTENTFUL_PREVIEW_TOKEN=${CONTENTFUL_PREVIEW_TOKEN}`
  ].filter(Boolean))
  .then((result) => {
    console.log('✔ e2e test succeeded:')
    console.log(result.cmd)
    console.log(result.stdout)
    server.close()
    process.exit(0)
  })
  .catch((error) => {
    console.log(`✖ e2e test failed with status code ${error.code}:`)
    console.error(error.cmd)
    console.error(error.stdout)
    console.error(error.stderr)
    server.close()
    process.exit(1)
  })
})
