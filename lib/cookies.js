const ONE_YEAR_IN_SECONDS = 31536000
module.exports.updateCookie = (response, cookieName, value) => {
  response.cookie(cookieName, value, { maxAge: ONE_YEAR_IN_SECONDS, httpOnly: true })
}
