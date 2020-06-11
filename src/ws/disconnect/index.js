let data = require('@begin/data')
let arc = require('@architect/functions')

exports.handler = async function connected(event) {
  // incoming socket connectionId from disconnection
  let id = event.requestContext.connectionId
  // remove connectionId from database
  await data.destroy({table: 'connected', key: id})
  console.log('connectionID deleted')

  try {
    let connected = await data.get({table: 'connected'})
    await Promise.all(connected.map(c=> {
      return new Promise((res, rej)=> {
        let payload = {
          action: 'disconnect'
        }
        // callback style
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
