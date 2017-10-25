const url = require('url')

module.exports = (modifier) => {
  return (req, res, next) => {
    const baseUrl = url.format({ protocol: req.protocol, host: req.get('host') })
    const parts = url.parse(req.url).pathname.split('/').filter(Boolean)
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
    req.app.locals.breadcrumb = items
    // Next operation
    next()
  }
}
