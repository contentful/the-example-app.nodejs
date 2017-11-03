const url = require('url')

module.exports = (modifier) => {
  return (request, response, next) => {
    const baseUrl = url.format({ protocol: request.protocol, host: request.get('host') })
    const urlComponents = url.parse(request.url).pathname.split('/').filter(Boolean)
    let breadcrumbs = []

    breadcrumbs.push({ label: 'Home', url: baseUrl })
    // Map components of the path to breadcrumbs with resolvable URLs
    let mappedComponents = urlComponents.map((component, i, array) => {
      const path = array.slice(0, i + 1).join('/')
      return {
        label: component.replace(/-/g, ' '),
        url: url.resolve(baseUrl, path),
        path: path
      }
    })
    breadcrumbs = breadcrumbs.concat(mappedComponents)
    if (modifier) {
      breadcrumbs = breadcrumbs.map(modifier)
    }
    // Make it global
    request.app.locals.breadcrumb = breadcrumbs
    next()
  }
}
