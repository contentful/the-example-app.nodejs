module.exports = (response) => {
  return response.locals.settings.editorialFeatures && response.locals.currentApi.id === 'cpa'
}
