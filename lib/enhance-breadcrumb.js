module.exports = (request, resource) => {
  const breadcrumbs = request.app.locals.breadcrumb

  let enhancedBreadcrumbs = breadcrumbs.map((breadcrumb) => {
    if (breadcrumb.label.replace(/ /g, '-') === resource.fields.slug) {
      breadcrumb.label = resource.fields.title
    }
    return breadcrumb
  })

  // We replace the breadcrumbs with the enhanced version
  request.app.locals.breadcrumb = enhancedBreadcrumbs
}
