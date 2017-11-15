const path = require('path')

const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const express = require('express')
const logger = require('morgan')
const querystring = require('querystring')
const helmet = require('helmet')

// Load environment variables using dotenv
require('dotenv').config({ path: 'variables.env' })

const helpers = require('./helpers')
const { translate, initializeTranslations } = require('./i18n/i18n')
const breadcrumb = require('./lib/breadcrumb')
const settings = require('./lib/settings')
const routes = require('./routes/index')
const { getSpace } = require('./services/contentful')
const { catchErrors } = require('./handlers/errorHandlers')

const app = express()

// View engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(logger('dev'))
app.use(helmet())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// Force all requests on production to be served over https
app.use(function (req, res, next) {
  if (req.headers['x-forwarded-proto'] !== 'https' && process.env.NODE_ENV === 'production') {
    var secureUrl = 'https://' + req.hostname + req.originalUrl
    res.redirect(302, secureUrl)
  }
  next()
})

// Set our application settings based on environment variables or query parameters
app.use(settings)

// Make data available for our views to consume
app.use(catchErrors(async function (request, response, next) {
  // Get enabled locales from Contentful
  response.locals.locales = [{code: 'en-US', name: 'U.S. English'}]
  response.locals.currentLocale = response.locals.locales[0]
  // Inject custom helpers
  response.locals.helpers = helpers

  // Make query string available in templates to render links properly
  const qs = querystring.stringify(request.query)
  response.locals.queryString = qs ? `?${qs}` : ''
  response.locals.query = request.query
  response.locals.currentPath = request.path

  // Initialize translations and include them on templates
  initializeTranslations()
  response.locals.translate = translate

  // Set active api based on query parameter
  const apis = [
    {
      id: 'cda',
      label: translate('contentDeliveryApiLabel', response.locals.currentLocale.code)
    },
    {
      id: 'cpa',
      label: translate('contentPreviewApiLabel', response.locals.currentLocale.code)
    }
  ]

  response.locals.currentApi = apis
    .find((api) => api.id === (request.query.api || 'cda'))

  const space = await getSpace()
  response.locals.locales = space.locales

  const defaultLocale = response.locals.locales
    .find((locale) => locale.default)

  if (request.query.locale) {
    response.locals.currentLocale = space.locales
      .find((locale) => locale.code === request.query.locale)
  }

  if (!response.locals.currentLocale) {
    response.locals.currentLocale = defaultLocale
  }

  next()
}))

app.use(breadcrumb())

// Initialize the route handling
// Check ./routes/index.js to get a list of all implemented routes
app.use('/', routes)

// Catch 404 and forward to error handler
app.use(function (request, response, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// Error handler
app.use(function (err, request, response, next) {
  // Set locals, only providing error in development
  console.log(err.response.status)
  response.locals.error = request.app.get('env') === 'development' ? err : {}
  response.locals.error.status = err.status || 500
  // Render the error page
  response.status(err.status || 500)
  response.render('error')
})

module.exports = app
