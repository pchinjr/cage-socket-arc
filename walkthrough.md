# Full Walkthrough Tutorial of Cage Socket with Architect

## Face|On
I believe very strongly in the power of the Internet. I'm also lucky enough to be a part of the growing space of web development. The internet is a great tool for making really strong human connections. They let us express ourselves, stay in touch, and spread information. Creating applications to enhance connections brings a lot of value to our communities and our organizations. Before I knew about REST APIs and GraphQL, I was using a library called Socket.io with a little Digital Ocean droplet. I made WebSocket APIs without even knowing it. It was just really easy for me to think about. There's different channels I can send data along and I didn't have to make requests with headers or AJAX calls or worry about broken promises. The benefit was that everything was in near real time, so I could control Nodebots with Johnny-Five or make a dashboard that would update with real time information. I want to show people that the real time web is still here and getting better every day. Now we can make WebSockets without a dedicated server. Using some AWS services and OpenJS Architect, I can build something that has automatic scale built into it, and probably won't cost much to get started. I made this demo as thought experiment. I wanted to tap into the collective mind that we all sense when we look at something really large, like the moon in the sky. I wonder how many others are looking at the same moon. It's probably billions of people all over the world. It's that one thing that most humans can relate to. In that same vein, I wanted a page where people can join and share a collective experience. #praisecage

1. Create a new Architect project 
```bash
npm init @architect ./websocket-demo
cd websocket-demo
```
2. Modify the `.arc` file with the following:
```md
# .arc
@app
cage-socket-arc

@cdn

@ws

@static
folder public
fingerprint true

@http
get /
get /connections

@tables
data
  scopeID *String
  dataID **String
  ttl TTL

@aws
profile default
region us-east-1
```
3. run `npm start` to start Sandbox and scaffold the functions. You should now see the entire folder structure of the app. Each Lambda function is a self contained folder, with it's own dependencies. 

```md
websocket-demo/
│── public/
├── src/http/
│       ├──get-index
│       ├──get-connections
├── ws/
│   ├── connect/
│   ├── default/
│   └── disconnect/
```
4. Since each function is invoked and deployed as isolated units, we need to install any dependencies locally. `@architect/functions` is a runtime helper library. In this function, we need to do some service discovery for the URL of our S3 bucket. The `http.helpers.static` method let's us access assets in the public folder without worrying about which environment we are in.
```bash
cd src/http/get-index
npm init -y
npm i @architect/functions
```
```js
// src/http/get-index/index.js
let arc = require('@architect/functions')
let static = arc.http.helpers.static
let getURL = require('./get-web-socket-url')

// renders HTML string with clientside js bundle
exports.handler = async function http(req) {
  return {
    headers: {'content-type': 'text/html; charset=utf8'},
    body: `<!doctype html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width">
</head> 
<body>
<h1>#PraiseCage Face|On</h1>
<p><a href="https://github.com/pchinjr/cage-socket-arc">Source on GitHub</a></p>
<button id="leftButton">Left</button>
<button id="centerButton">Center</button>
<button id="rightButton">Right</button>
<main>Loading...</main>
<script>
window.WS_URL = '${getURL()}'
</script>
<script type=module src=${static('/index.mjs')}></script>
</body>
</html>`
  }
}
```
5. We are also going to write a utility function to use the correct WebSocket endpoint. When Architect deploys your app, it will add an environment variable to look up the WebSocket URL at runtime.
```js
// src/http/get-index/get-web-socket-url.js
module.exports = function getWS() {
  let env = process.env.NODE_ENV
  let testing = 'ws://localhost:3333'
  let staging = process.env.ARC_WSS_URL
  let production = process.env.ARC_WSS_URL
  if (env === 'testing')
    return testing
  if (env === 'staging')
    return staging
  if (env === 'production')
    return production
  return testing
}
```
6. Now let's write the JS that will be served from the `public` folder and provide client-side logic
```js
// public/index.mjs
// get the WebSocket url from the backend
let url = window.WS_URL

// all the DOM nodes this script will mutate
let main = document.getElementsByTagName('main')[0]
let leftButton = document.getElementById('leftButton')
let centerButton = document.getElementById('centerButton')
let rightButton = document.getElementById('rightButton')

// data fetch for active connections to render faces
function init() {
  //make GET request
  fetch('/connections', {
    credentials: 'same-origin',
    headers: {
      'Content-Type':'application/json'
    }
  })
  // take results and turn into JSON
  .then(res => res.json())
  // use the connectionIDs to insert faces
  .then(connected => insertFaces(connected))
}

// iterate over connectionIDs and update the DOM
function insertFaces(connected) {
  main.innerHTML = connected.connections.map( c => renderFace(c)).join('')
}

// use connectionIDs to render a face image element with connectionID
function renderFace(props) {
  return `
  <img src="/_static/cagepng.png" id=${props.key} class="face" style="transform: rotate(${props.direction}deg)"/>
  `
}

// setup the WebSocket
let ws = new WebSocket(url)
ws.onopen = open
ws.onclose = close
ws.onmessage = message

// connect to the WebSocket
async function open() { 
  let payload = {
    action: 'connected'
  }
  // send an action to the $default handler
  ws.send(JSON.stringify(payload))
}

// report a closed web socket connection
function close() {
  main.innerHTML = `Closed <a href=/>reload</a>`
}

// write a message into main
function message(e) {
  // capture event "action"
  let action = JSON.parse(e.data).action
  
  // receive server action and update the client
  if(action === 'connected'||'disconnect') {
    init()
  }
  
  // receive server action and update the client
  if(action === 'rotate') {
    let turnId = JSON.parse(e.data).key
    let face = document.getElementById(turnId)
    let direction = JSON.parse(e.data).direction
    face.setAttribute('style', `transform: rotate(${direction}deg)`)
  }
}

// add click handlers and send direction attribute to the database
leftButton.addEventListener('click', function(e){
  let payload = {
    action: 'rotate',
    direction: -90
  }
  ws.send(JSON.stringify(payload))
})

centerButton.addEventListener('click', function(e){
  let payload = {
    action: 'rotate',
    direction: 0
  }
  ws.send(JSON.stringify(payload))
})

rightButton.addEventListener('click', function(e){
  let payload = {
    action: 'rotate',
    direction: 90
  }
  ws.send(JSON.stringify(payload))
})
```
8. We need a way to get all the connections as a user joins, so we will make a GET endpoint that returns all connections. This function makes use of `@begin/data`, an open source client for DynamoDB. It handles connecting to DynamoDB and helpful methods to do CRUD operations. 
```bash
cd src/http/get-connections/
npm init -y
npm install @begin/data
```
```js
// src/http/get-connections/index.js
const data = require('@begin/data')

// retreive all connections in the database and return as JSON
exports.handler = async function connections (req) {
  let connections = await data.get({
    table: 'connected'
  })

  return {
    statusCode: 201,
    headers: {
      'content-type': 'application/json; charset=utf8',
      'cache-control': 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0'
    },
    body: JSON.stringify( {connections} )
  }
}
```
9. It is now the moment you have been waiting for, time for some WebSocket fun! There's only three WebSocket functions we will use, `$connect`, `$default`, and `$disconnect`. Each are invoked based on the event being sent from the client. We will start with the connection handler.
```bash
cd src/ws/connect
npm init -y
npm install @begin/data
```
```js
// src/ws/connect/index.js
let data = require('@begin/data')

exports.handler = async function connected(event) {
  let connectionID = event.requestContext.connectionId
  // insert new connectionID to the database
  try {
    await data.set({
      table: 'connected',
      key: connectionID, 
    })
  }
  catch(e) {
    console.log('FAIL', e) 
  }
  // must return 200 to upgrade the connection to ws
  // does not interact with the socket connection after return 200
  return {statusCode: 200}
}
```
10. The `$default` handler receives all messages sent by the client. The logic will perform different operations based on the "action" that the client is sending.
```bash
cd src/ws/default
npm init -y
npm install @architect/functions @begin/data
```
```js
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
```
11. Finally we need to remove the `connectionId`s from the database when a user disconnects. 
```bash
cd src/ws/disconnect
npm init -y 
npm install @architect/functions @begin/data
```
```js
let data = require('@begin/data')
let arc = require('@architect/functions')

exports.handler = async function connected(event) {
  // incoming socket connectionId from disconnection
  let id = event.requestContext.connectionId
  // remove connectionId from database
  await data.destroy({table: 'connected', key: id})
  console.log('connectionID deleted')
  
  
  try {
    // get current state after disconnection
    let connected = await data.get({table: 'connected'})
    // send new state to all connected clients
    await Promise.all(connected.map(c=> {
      return new Promise((res, rej)=> {
        // the client is listening for this payload to update the DOM
        let payload = {
          action: 'disconnect'
        }
        // callback style of promise
        arc.ws.send({
          id: c.key, 
          payload: payload
        },
        function errback(err) {
          if (err) {
            console.log('swallowing promise error', e)
          }
          res()
        })
      }) 
    }))


  }
  catch(e) {
    console.log('FAIL', e) 
  }

  return {statusCode: 200}
}
```
12. Try it out by running `npm start` and navigating to `http://localhost:3333` on different browser tabs!

13. When you are ready to deploy and have your AWS credentials set, run `arc deploy` for staging and `arc deploy production` for production. If you want to see the generated CloudFormation stack, run `arc deploy --dry-run` and check out `sam.yaml`.