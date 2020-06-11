module.exports = function getWS() {
  let env = process.env.NODE_ENV
  let testing = 'ws://localhost:3333'
  let staging = process.env.WSS_STAGING
  let production = process.env.WSS_PROD
  if (env === 'testing')
    return testing
  if (env === 'staging')
    return staging
  if (env === 'production')
    return production
  return testing
}
