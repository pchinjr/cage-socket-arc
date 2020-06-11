let data = require('@begin/data')

exports.handler = async function connected(event) {
  let connectionID = event.requestContext.connectionId
  // insert new connectionID to the database
  try {
    await data.set({
      table: 'connected',
      key: connectionID, 
    })
  }
  catch(e) {
    console.log('FAIL', e) 
  }
  // must return 200 to upgrade the connection to ws
  // does not interact with the socket connection after return 200
  return {statusCode: 200}
}
