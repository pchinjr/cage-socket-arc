let arc = require('@architect/functions')

exports.handler = async function connected(event) {
  let id = event.requestContext.connectionId
  let message = JSON.parse(event.body)
  let payload = {ok: true, ts: Date.now(), message}
  console.log(event)
  await arc.ws.send({id, payload})
  return {statusCode: 200}
}
