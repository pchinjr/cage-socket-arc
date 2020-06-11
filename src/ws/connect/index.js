let data = require('@begin/data')

exports.handler = async function connected(event) {

  let connectionID = event.requestContext.connectionId

  try {
    await data.set({
      table: 'connected',
      key: connectionID, 
    })
    console.log(`${connectionID} saved to table`)
  }
  catch(e) {
    console.log('FAIL', e) 
  }

  

  return {statusCode: 200}
}
