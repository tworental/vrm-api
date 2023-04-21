const lookup = require('country-code-lookup')

exports.getByISO = (code) => {
  const data = lookup.byIso(code)

  return data ? data.country : code
}
