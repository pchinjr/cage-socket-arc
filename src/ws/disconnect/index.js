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
    console.log('value here', value)
  }
  catch(e) {
    console.log('FAIL', e) 
  }

  return {statusCode: 200}
}
