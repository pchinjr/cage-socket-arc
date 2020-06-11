/**
 * returns hardcoded web socket urls
 * (you could also move to env vars or infer from appname)
 */
module.exports = function getWS() {
  let env = process.env.NODE_ENV
  let testing = 'ws://localhost:3333'
  let staging = 'wss://1bm7kk0nsb.execute-api.us-east-1.amazonaws.com/staging'
  let production = 'wss://1bm7kk0nsb.execute-api.us-east-1.amazonaws.com/'
  if (env === 'testing')
    return testing
  if (env === 'staging')
    return staging
  if (env === 'production')
    return production
  return testing
}
