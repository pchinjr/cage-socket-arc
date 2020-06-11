let arc = require('@architect/functions')
let data = require('@begin/data')

exports.handler = async function connected(event) {

  let id = event.requestContext.connectionId  
  let action = JSON.parse(event.body).action
  let direction = JSON.parse(event.body).direction
  
  await data.set({
    table: 'connected',
    key: id,
    direction 
  })
  
  let connected = await data.get({table: 'connected'})
  let payload = {key: id, action, direction}

  // 
  if(action === 'connected') {
    await Promise.all(connected.map(c=> {
      return arc.ws.send({
        id: c.key, 
        payload: payload
      }, console.log('new connection sent'))
    }))
  }

  if(action === 'rotate') {
    await Promise.all(connected.map(c=> {
      return arc.ws.send({
        id: c.key, 
        payload: payload
      }, console.log('rotation sent'))
    }))
  }
  
  return {statusCode: 200}
}
