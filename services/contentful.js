const { createClient } = require('contentful')

let cdaClient = null
let cpaClient = null

exports.initClient = (options) => {
  const config = options || {
    space: process.env.CF_SPACE,
    cda: process.env.CF_ACCESS_TOKEN,
    cpa: process.env.CF_PREVIEW_ACCESS_TOKEN
  }
  cdaClient = createClient({
    space: config.space,
    accessToken: config.cda
  })
  cpaClient = createClient({
    space: config.space,
    accessToken: config.cpa,
    host: 'preview.contentful.com'
  })
}

exports.getCourses = (locale = 'en-US', api = `cda`) => {
  // to get all the courses we request all the entries
  // with the content_type `course` from Contentful
  const client = api === 'cda' ? cdaClient : cpaClient
  return client.getEntries({content_type: 'course', locale, include: 10})
    .then((response) => response.items)
}

exports.getLandingPage = (locale = 'en-US', api = `cda`) => {
  // our Home page is fully configureable via Contentful
  const client = api === 'cda' ? cdaClient : cpaClient
  // TODO slug should be renamed to `contentful-the-example-app` or something ....
  return client.getEntries({content_type: 'landingPage', locale, 'fields.slug': 'contentful-university', include: 10})
    .then((response) => response.items[0])
}

exports.getCourse = (slug, locale = 'en-US', api = `cda`) => {
  // the SDK supports link resolution only when you call the collection endpoints
  // That's why we are using getEntries with a query instead of getEntry(entryId)
  // make sure to specify the content_type whenever you want to perform a query
  const client = api === 'cda' ? cdaClient : cpaClient
  return client.getEntries({content_type: 'course', 'fields.slug': slug, locale, include: 10})
    .then((response) => response.items[0])
}

exports.getLessons = (courseId, locale = 'en-US', api = `cda`) => {
  // TODO
}

exports.getCategories = (locale = 'en-US', api = `cda`) => {
  const client = api === 'cda' ? cdaClient : cpaClient
  return client.getEntries({content_type: 'category', locale})
    .then((response) => response.items)
}

exports.getCoursesByCategory = (category, locale = 'en-US', api = `cda`) => {
  const client = api === 'cda' ? cdaClient : cpaClient
  return client.getEntries({
    content_type: 'course',
    'fields.categories.sys.id': category,
    locale,
    include: 10
  })
    .then((response) => response.items)
}

