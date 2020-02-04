let data = require('@begin/data')
let arc = require('@architect/functions')

exports.handler = async function connected(event) {

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
    
    // increment the count
    let value =  await data.decr({table, key, prop})
    let connected = await data.get({table: 'connected'})

    await Promise.all(connected.map(c=> {
      return new Promise((res, rej)=> {
        // callback style
        arc.ws.send({
          id: c.key, 
          payload: value
        },
        function errback(err) {
          if (err) {
            console.log('swallowing promise error', e)
          }
          res()
        })
        /**
         * promise style
        try {
          !async function iiafe() {
            await arc.ws.send({
              id: c.key, 
              payload: value
            })
          }()
        }
        catch(e) {
          console.log('swallowing promise error', e)
        }
        res()*/
      }) 
    }))


  }
  catch(e) {
    console.log('FAIL', e) 
  }

  return {statusCode: 200}
}
