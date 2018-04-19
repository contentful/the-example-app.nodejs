/**
 * The purpose of this module is to get data from contentful
 */
const { createClient } = require('contentful')

let deliveryClient = null
let previewClient = null

/**
 * Initialize the contentful Client
 * @param options {spaceId: string, deliveryToken: string, previewToken: string}
 *
 * @returns {undefined}
 */
module.exports.initClients = (options) => {
  // Getting the app version
  const { version } = require('../package.json')
  const applicationName = `the-example-app.nodejs/${version}`

  const config = options || {
    spaceId: process.env.CONTENTFUL_SPACE_ID,
    deliveryToken: process.env.CONTENTFUL_DELIVERY_TOKEN,
    previewToken: process.env.CONTENTFUL_PREVIEW_TOKEN
  }
  deliveryClient = createClient({
    application: applicationName,
    space: config.spaceId,
    accessToken: config.deliveryToken,
    // Environment variable is used here to enable testing this app internally at Contentful.
    // You can just omit the host since it defaults to 'cdn.contentful.com'
    host: process.env.CONTENTFUL_DELIVERY_API_HOST,
    removeUnresolved: true
  })
  previewClient = createClient({
    application: applicationName,
    space: config.spaceId,
    accessToken: config.previewToken,
    // Environment variable is used here to enable testing this app internally at Contentful.
    // You should use 'preview.contentful.com' as host to use the preview api
    host: process.env.CONTENTFUL_PREVIEW_API_HOST,
    removeUnresolved: true
  })
}

/**
 * Get the Space the app is connected to. Used for the settings form and to get all available locales
 * @param api - string - the api to use, cda or cap. Default: 'cda'
 * @returns {undefined}
 */
module.exports.getSpace = throwOnEmptyResult('Space', (api = 'cda') => {
  return getClient(api).getSpace()
})

/**
 * Get the environment locales
 * @param api - string - the api to use, cda or cap. Default: 'cda'
 * @returns {undefined}
 */
module.exports.getLocales = throwOnEmptyResult('Environment', (api = 'cda') => {
  return getClient(api).getLocales()
    .then((response) => response.items)
})

/**
 * Gets an entry. Used to detect the `Draft` or `Pending Changes` state
 * @param entryId - string - the entry id
 * @param api - string - the api to use fetching the entry
 *
 * @returns {Object}
 */

module.exports.getEntry = throwOnEmptyResult('Entry', (entryId, contentType, api = 'cda') => {
  return getClient(api).getEntries({content_type: contentType, 'sys.id': entryId})
    .then((response) => response.items[0])
})

/**
 * Get all entries with content_type `course`
 * @param locale - string - the locale of the entry [default: 'en-US']
 * @param api - string the api enpoint to use when fetching the data
 * @returns {Array<Object>}
 */
module.exports.getCourses = throwOnEmptyResult('Course', (locale = 'en-US', api = 'cda') => {
  return getClient(api).getEntries({
    content_type: 'course',
    locale,
    order: '-sys.createdAt', // Ordering the entries by creation date
    include: 1 // We use include param to increase the link level, the include value goes from 1 to 6
  })
    .then((response) => response.items)
})

/**
 * Get entries of content_type `layout` e.g. Landing page
 * @param slug - string - the slug of the entry to use in the query
 * @param locale - string - locale of the entry to request [default: 'en-US']
 * @param api - string - the api enpoint to use when fetching the data
 * @returns {Object}
 */
module.exports.getLandingPage = (slug, locale = 'en-US', api = 'cda') => {
  // Even though we need a single entry, we request it using the collection endpoint
  // To get all the linked refs in one go, the SDK will use the data and resolve the links automatically
  return getClient(api).getEntries({
    content_type: 'layout',
    locale,
    'fields.slug': slug,
    include: 3
  })
    .then((response) => response.items[0])
}

/**
 * Get an entry with content_type `course`
 * @param slug - string - the slug of the entry to use in the query
 * @param locale - string - locale of the entry to request [default: 'en-US']
 * @param api - string - the api enpoint to use when fetching the data
 * @returns {Object}
 */
module.exports.getCourse = throwOnEmptyResult('Course', (slug, locale = 'en-US', api = 'cda') => {
  // Even though we need a single entry, we request it using the collection endpoint
  // To get all the linked refs in one go, the SDK will use the data and resolve the links automatically
  return getClient(api).getEntries({
    content_type: 'course',
    'fields.slug': slug,
    locale,
    include: 2
  })
    .then((response) => response.items[0])
})

module.exports.getCategories = throwOnEmptyResult('Course', (locale = 'en-US', api = 'cda') => {
  return getClient(api).getEntries({content_type: 'category', locale})
    .then((response) => response.items)
})

/**
 * Get Courses by Categories
 * To get a course by category, simply query all entries
 * with a query params `fields.categories.sys.id` equal to the desired category id
 * Note that you need to send the `content_type` param to be able to query the entry
 * @param category - string - the id of the category
 * @param locale - string - locale of the entry to request [default: 'en-US']
 * @param api - string - the api enpoint to use when fetching the data
 * @returns {Object}
 */
module.exports.getCoursesByCategory = throwOnEmptyResult('Category', (category, locale = 'en-US', api = 'cda') => {
  return getClient(api).getEntries({
    content_type: 'course',
    'fields.categories.sys.id': category,
    locale,
    order: '-sys.createdAt',
    include: 1
  })
    .then((response) => response.items)
})

// Utility function
function getClient (api = 'cda') {
  return api === 'cda' ? deliveryClient : previewClient
}

/**
 * Utility function for wrapping regular API calls.
 * This is done for easily catching 404 errors.
 * @param  {string}   context The type of result the function is looking for
 * @param  {Function} fn      The function to wrap
 * @return {Object}           The result of `fn`, if not empty
 * @throws {Error}    When `fn` returns an empty result
 */
function throwOnEmptyResult (context, fn) {
  return function (...params) {
    return fn(...params)
      .then((data) => {
        if (!data) {
          var err = new Error(`${context} Not Found`)
          err.status = 404
          throw err
        }
        return data
      })
  }
}
