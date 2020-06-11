let arc = require('@architect/functions')
let data = require('@begin/data')

exports.handler = async function connected(event) {

  let id = event.requestContext.connectionId  
  let action = JSON.parse(event.body).action
  let connected = await data.get({table: 'connected'})
  let payload = {key: id, ts: Date.now(), action}

  // 
  if(action === 'connected') {
    await Promise.all(connected.map(c=> {
      return arc.ws.send({
        id: c.key, 
        payload: payload
      }, console.log('new connection sent'))
    }))
  }
  
  

  
  
  

  return {statusCode: 200}
}
