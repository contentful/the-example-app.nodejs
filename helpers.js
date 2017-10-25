const marked = require('marked')
// Parse markdown text
exports.markdown = (content) => {
  content = content || ''
  return marked(removeIvalidDataURL(content), {sanitize: true})
}

// Dump is a handy debugging function we can use to sort of "console.log" our data
exports.dump = (obj) => JSON.stringify(obj, null, 2)

// Evil users might try to add base64 url data to execute js
// So we should take care of that
function removeIvalidDataURL (content) {
  let regex = /data:\S+;base64\S*/gm
  return content.replace(regex, '#')
}

exports.formatMetaTitle = (title) => {
  if (!title) {
    return 'The Example App'
  }
  return `${title.charAt(0).toUpperCase()}${title.slice(1)} — The Example App`
}
