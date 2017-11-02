const ONE_YEAR = 31536000
module.exports.updateCookie = (response, cookieName, value) => {
  response.cookie(cookieName, value, { maxAge: ONE_YEAR, httpOnly: true })
}
