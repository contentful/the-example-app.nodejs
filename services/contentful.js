const { createClient } = require('contentful')

let client = null
let previewClient = null

exports.initClient = (config = {space: process.env.CF_SPACE, accessToken: process.env.CF_ACCESS_TOKEN}) => {
  client = createClient(config)
  previewClient = createClient({...config, host: 'preview.contentful.com'})
}

exports.getCourses = () => {
  // to get all the courses we simply request from Contentful all the entries
  // with the content_type `course`
  return client.getEntries({content_type: 'course'})
}

exports.getLandingPage = () => {
  // our Home page is fully configureable via contentful
  return client.getEntries({content_type: 'landingPage', 'fields.slug': 'contentful-university'})
    .then((response) => response.items[0])
}

exports.getCourse = (slug) => {
  // the SDK support link resolution only when you request the collection endpoint
  // That's why we are using getEntries with a query instead of getEntry(entryId)
  // make sure to specify the content_type whenever you want to perform a query
  return client.getEntries({content_type: 'course', 'fields.slug': slug})
    .then((response) => response.items[0])
}

exports.getLessons = (courseId) => {
  // TODO
}

exports.getCategories = () => {
  // TODO
}

exports.getCoursesByCategory = (category) => {
  // TODO
}

