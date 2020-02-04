let data = require('@begin/data')
let arc = require('@architect/functions')

exports.handler = async function connected(event) {

  let connectionID = event.requestContext.connectionId
  let payload = {ok: true, ts: Date.now()}
  
  let table = 'connections'
  let key = 'alltime'
  let prop = 'countess'

  try {

    let counter = await data.get({table, key})
    if (!counter) {
      await data.set({
        table,
        key,
        countess: 0
      })
    }

    await data.set({
      table: 'connected',
      key: connectionID, 
    })
    
    // increment the count
    let value = await data.incr({table, key, prop})
  }
  catch(e) {
    console.log('FAIL', e) 
  }

  return {statusCode: 200}
}
