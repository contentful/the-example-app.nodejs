const url = require('url')

module.exports = (modifier) => {
  return (request, response, next) => {
    const baseUrl = url.format({ protocol: request.protocol, host: request.get('host') })
    const urlComponents = url.parse(req.url).pathname.split('/').filter(Boolean)
    let items = []

    items.push({ label: 'Home', url: baseUrl })
    
    // Map components of the path to breadcrumbs with resolvable URLs.
    let mappedParts = urlComponents.map((component, i, array) => {
      const path = array.slice(0, i + 1).join('/')
      return {
        label: component.replace(/-/g, ' '),
        url: url.resolve(baseUrl, path),
        path: path
      }
    })

    items = items.concat(mappedParts)
    if (modifier) {
      items = items.map(modifier)
    }
    // Assign the breadcrumbs to the request by making them global.
    request.app.locals.breadcrumb = items
    // Next operation.
    next()
  }
}
