const url = require('url')
const { translate, translationAvaliable } = require('../i18n/i18n')

module.exports = (modifier) => {
  return (request, response, next) => {
    const baseUrl = url.format({ protocol: request.protocol, host: request.get('host') })
    const urlComponents = url.parse(request.url).pathname.split('/').filter(Boolean)
    let breadcrumbs = []

    breadcrumbs.push({
      label: translate('homeLabel', response.locals.currentLocale.code),
      url: baseUrl
    })
    // Map components of the path to breadcrumbs with resolvable URLs
    let mappedComponents = urlComponents.map((component, i, array) => {
      const currentLocale = response.locals.currentLocale
      const path = array.slice(0, i + 1).join('/')

      let label = component.replace(/-/g, ' ')
      if (translationAvaliable(`${label}Label`, currentLocale.code)) {
        label = translate(`${label}Label`, currentLocale.code)
      }

      return {
        label: label,
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
