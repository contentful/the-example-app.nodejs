const TWO_DAYS_IN_SECONDS = 172800 // 60 * 60 * 24 * 2
module.exports.updateCookie = (response, cookieName, value) => {
  response.cookie(cookieName, value, { maxAge: TWO_DAYS_IN_SECONDS, httpOnly: true })
}
