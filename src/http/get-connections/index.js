const data = require('@begin/data')

// retreive all connections in the database and return as JSON
exports.handler = async function connections (req) {
  let connections = await data.get({
    table: 'connected'
  })

  return {
    statusCode: 201,
    headers: {
      'content-type': 'application/json; charset=utf8',
      'cache-control': 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0'
    },
    body: JSON.stringify( {connections} )
  }
}