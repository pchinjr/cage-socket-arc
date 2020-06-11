let data = require('@begin/data')
let arc = require('@architect/functions')

exports.handler = async function connected(event) {
  // incoming socket connectionId from disconnection
  let id = event.requestContext.connectionId
  // remove connectionId from database
  await data.destroy({table: 'connected', key: id})
  console.log('connectionID deleted')
  
  
  try {
    // get current state after disconnection
    let connected = await data.get({table: 'connected'})
    // send new state to all connected clients
    await Promise.all(connected.map(c=> {
      return new Promise((res, rej)=> {
        // the client is listening for this payload to update the DOM
        let payload = {
          action: 'disconnect'
        }
        // callback style of promise
        arc.ws.send({
          id: c.key, 
          payload: payload
        },
        function errback(err) {
          if (err) {
            console.log('swallowing promise error', e)
          }
          res()
        })
      }) 
    }))


  }
  catch(e) {
    console.log('FAIL', e) 
  }

  return {statusCode: 200}
}
