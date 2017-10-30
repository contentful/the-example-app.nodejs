const ONE_YEAR = 31536000
module.exports.updateCookie = (res, cookieName, value) => {
  res.cookie(cookieName, value, { maxAge: ONE_YEAR, httpOnly: true })
}
