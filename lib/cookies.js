const TWO_DAYS_IN_MILLISECONDS = 172800000 // 1000 * 60 * 60 * 24 * 2
module.exports.updateCookie = (response, cookieName, value) => {
  response.cookie(cookieName, value, { maxAge: TWO_DAYS_IN_MILLISECONDS, httpOnly: true })
}
