// public/index.mjs

// get the WebSocket url from the backend
let url = window.WS_URL

// all the DOM nodes this script will mutate
let main = document.getElementsByTagName('main')[0]

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
  <img src="/_static/cagepng.png" id=${props.key}/>
  `
}

// setup the WebSocket
let ws = new WebSocket(url)
ws.onopen = open
ws.onclose = close
ws.onmessage = message

// connect to the WebSocket
async function open() { 
  init() 
  let payload = {
    action: 'connected'
  }
  // send an action to the $default handler
  ws.send(JSON.stringify(payload))
}

// report a closed web socket connection
function close() {
  main.innerHTML = 'Closed <a href=/>reload</a>'
}

// write a message into main
function message(e) {
  init()
}

// sends messages to the lambda
// msg.addEventListener('keyup', function(e) {
//   if (e.key == 'Enter') {
//     let text = e.target.value // get the text
//     console.log(e.target.value)
//     console.log(typeof(text))
//     e.target.value = ''       // clear the text
//     //ws.send({text})
//     ws.send(JSON.stringify({text}))
//   }
// })