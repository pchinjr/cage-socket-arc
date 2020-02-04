let arc = require('@architect/functions')
let data = require('@begin/data')

exports.handler = async function connected(event) {

  let id = event.requestContext.connectionId
  let message = JSON.parse(event.body)
  let payload = {ok: true, ts: Date.now(), message}
  await arc.ws.send({id, payload})

  let counter = await data.get({table:'connections', key:'alltime'})
  let connected = await data.get({table: 'connected'})

  await Promise.all(connected.map(c=> {
    return arc.ws.send({
      id: c.key, 
      payload: counter
    })
  }))

  return {statusCode: 200}
}
