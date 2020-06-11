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
    console.log(e)
    let turnId = JSON.parse(e.data).key
    let face = document.getElementById(turnId)
    let direction = JSON.parse(e.data).direction
    face.setAttribute('style', `transform: rotate(${direction}deg)`)
  }
}

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