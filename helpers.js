const marked = require('marked')

// Parse markdown text
module.exports.markdown = (content = '') => {
  if (!content.trim()) {
    return ''
  }
  return marked(removeInvalidDataURL(content), {sanitize: true})
}

// A handy debugging function we can use to sort of "console.log" our data
module.exports.dump = (obj) => JSON.stringify(obj, null, 2)

module.exports.formatMetaTitle = (title) => {
  if (!title) {
    return 'The Example App'
  }
  return `${title.charAt(0).toUpperCase()}${title.slice(1)} — The Example App`
}

/**
 * Evil users might try to add base64 url data to execute js code
 * so we should purge any potentially harmful data to mitigate risk
 */
function removeInvalidDataURL (content) {
  let regex = /data:\S+;base64\S*/gm
  return content.replace(regex, '#')
}
