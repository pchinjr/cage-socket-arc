let arc = require('@architect/functions')
let data = require('@begin/data')

// #default websocket route, all message events hit this route, excluding 'connect' and 'disconnect'
exports.handler = async function connected(event) {

  let id = event.requestContext.connectionId  
  let action = JSON.parse(event.body).action
  let direction = JSON.parse(event.body).direction
  
  // save direction to the database for incoming socket connectionId
  await data.set({
    table: 'connected',
    key: id,
    direction 
  })
  
  // get current state of all connections
  let connected = await data.get({table: 'connected'})
  let payload = {key: id, action, direction}

  // send updated state to all clients on a new connection
  if(action === 'connected') {
    await Promise.all(connected.map(c=> {
      return arc.ws.send({
        id: c.key, 
        payload: payload
      }, console.log('new connection sent'))
    }))
  }

  // send updated state to the clients on rotate message
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
