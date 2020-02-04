let arc = require('@architect/functions')

exports.handler = async function connected(event) {
  let id = event.requestContext.connectionId
  let payload = {ok: true, ts: Date.now()}
  //await arc.ws.send({id, payload})
  return {statusCode: 200}
}
