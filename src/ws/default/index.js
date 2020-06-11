let arc = require('@architect/functions')
let data = require('@begin/data')

exports.handler = async function connected(event) {

  console.log(`event object on ws:default - ${JSON.stringify(event.body)}`)

  let id = event.requestContext.connectionId
  
  let message = JSON.parse(event.body)
  
  let payload = {ok: true, ts: Date.now(), message}

  let connected = await data.get({table: 'connected'})
  console.log(connected)
  await Promise.all(connected.map(c=> {
    return arc.ws.send({
      id: c.key, 
      payload: payload
    }, console.log('message sent'))
  }))

  return {statusCode: 200}
}
