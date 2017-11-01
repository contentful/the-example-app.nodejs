const url = require('url')

module.exports = (modifier) => {
  return (request, response, next) => {
    const baseUrl = url.format({ protocol: request.protocol, host: request.get('host') })
    const parts = url.parse(request.url).pathname.split('/').filter(Boolean)
    let items = []

    items.push({ label: 'Home', url: baseUrl })
    items = items.concat(parts.map((part, i, array) => {
      const path = array.slice(0, i + 1).join('/')
      return {
        label: part.replace(/-/g, ' '),
        url: url.resolve(baseUrl, path),
        path: path
      }
    })
    )
    if (modifier) {
      items = items.map(modifier)
    }
    // Make it global
    request.app.locals.breadcrumb = items
    next()
  }
}
