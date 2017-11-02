/**
 * The purpose of this module is to get data from contentful
 */
const { createClient } = require('contentful')

let deliveryClient = null
let previewClient = null

/**
 * Initialize the contentful Client
 * @param options {space: string, cda: string, cpa: string}
 *
 * @returns {undefined}
 */
module.exports.initClient = (options) => {
  // Getting the app version
  const { version } = require('../package.json')

  const config = options || {
    spaceId: process.env.CF_SPACE_ID,
    deliveryToken: process.env.CF_DELIVERY_TOKEN,
    previewToken: process.env.CF_PREVIEW_TOKEN
  }
  deliveryClient = createClient({
    application: `contentful.the-example-app.node/${version}`,
    space: config.spaceId,
    accessToken: config.deliveryToken
  })
  previewClient = createClient({
    application: `contentful.the-example-app.node/${version}`,
    space: config.spaceId,
    accessToken: config.previewToken,
    host: 'preview.contentful.com'
  })
}

/**
 * Get the Space the app is connected to. Used for the settings form and to get all available locales
 * @param api - string - the api to use, cda or cap. Default: 'cda'
 * @returns {undefined}
 */
module.exports.getSpace = assert((api = `cda`) => {
  return getClient(api).getSpace()
}, 'Space')

/**
 * Get a single entry. Used to detect the `Draft` or `Pending Changes` state
 * @param entryId - string - the entry id
 * @param api - string - the api to use fetching the entry
 *
 * @returns {Object}
 */

module.exports.getEntry = assert((entryId, api = `cda`) => {
  return getClient(api).getEntry(entryId)
}, 'Entry')

/**
 * Get all entries with content_type `course`
 * @param locale - string - the locale of the entry [default: 'en-US']
 * @param api - string the api enpoint to use when fetching the data
 * @returns {Array<Object>}
 */
module.exports.getCourses = assert((locale = 'en-US', api = `cda`) => {
  return getClient(api).getEntries({
    content_type: 'course',
    locale,
    order: 'sys.createdAt', // Ordering the entries by creation date
    include: 6 // We use include param to increase the link level, the include value goes from 1 to 6
  })
    .then((response) => response.items)
}, 'Course')

/**
 * Get the an entry with `layout` content_type e.g. Landing page or About page
 * @param slug - string - the slug of the entry to use in the query
 * @param locale - string - locale of the entry to request [default: 'en-US']
 * @param api - string - the api enpoint to use when fetching the data
 * @returns {Object}
 */
module.exports.getLandingPage = (slug, locale = 'en-US', api = `cda`) => {
  // Even though we need a single entry, we request it using the collection endpoint
  // To get all the linked refs in one go, the SDK will use the data and resolve the links automatically
  return getClient(api).getEntries({
    content_type: 'layout',
    locale,
    'fields.slug': slug,
    include: 6
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
module.exports.getCourse = assert((slug, locale = 'en-US', api = `cda`) => {
  // Even though we need a single entry, we request it using the collection endpoint
  // To get all the linked refs in one go, the SDK will use the data and resolve the links automatically
  return getClient(api).getEntries({
    content_type: 'course',
    'fields.slug': slug,
    locale,
    include: 6
  })
    .then((response) => response.items[0])
}, 'Course')

module.exports.getCategories = assert((locale = 'en-US', api = `cda`) => {
  return getClient(api).getEntries({content_type: 'category', locale})
    .then((response) => response.items)
}, 'Course')

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
module.exports.getCoursesByCategory = assert((category, locale = 'en-US', api = `cda`) => {
  return getClient(api).getEntries({
    content_type: 'course',
    'fields.categories.sys.id': category,
    locale,
    order: '-sys.createdAt',
    include: 6
  })
    .then((response) => response.items)
}, 'Category')

// Utility function
function getClient (api = 'cda') {
  return api === 'cda' ? deliveryClient : previewClient
}

function assert (fn, context) {
  return function (request, response, next) {
    return fn(request, response, next)
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
