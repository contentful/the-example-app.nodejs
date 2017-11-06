const ONE_YEAR_IN_SECONDS = 86400
module.exports.updateCookie = (response, cookieName, value) => {
  response.cookie(cookieName, value, { maxAge: ONE_YEAR_IN_SECONDS, httpOnly: true })
}
