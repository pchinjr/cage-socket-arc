# Cage Socket - 2020 - Connection Makes Us Stronger

This is an interactive demo of serverless WebSockets using [OpenJS Architect](https://arc.codes), AWS API Gateway, DynamoDB, S3, and Lambda functions. [In December 2018, AWS announced that API Gateway had the ability to create WebSocket connections.](https://aws.amazon.com/blogs/compute/announcing-websocket-apis-in-amazon-api-gateway/) 

You are given three routes at API Gateway to route to three special Lambda functions.
 - $connect
 - $disconnect
 - $default

Each message sent has a connectionId and whatever JSON payload you want to send to the Lambda function. Since the Lambda functions are stateless, we can use DynamoDB to persist the connectionId and state of the client. This entire world state is rebroadcast to all connections in the database with it's own attributes.

To use this example, you will need to have NodeJS, OpenJS Architect, and an AWS account with Admin privileges. [For more information about AWS Credentials check out our docs](https://arc.codes/quickstart#local-credentials-file) Once deployed, your entire infrastructure is code defined by the `.arc` file. Each deploy will be deterministic with a full CloudFormation stack, except the CloudFront CDN, which still has to be deployed with the SDK, but Architect takes care of it. Just be patient as it may take a few minutes to resolve correctly. 

Clone this repo and then: 
```bash
npm install
npm start
```
Then navigate to http://localhost:3333 from a couple different browser tabs and have fun while also Praising Cage! 

Things to know about serverless WebSockets and API Gateway:
 - $connect/$disconnect route must return HTTP Status 200 to signal an upgrade from HTTP to WSS. The moment the $connect handler returns 200, you can't do anything else in that function.
 - $default catches everything else. I didn't try custom WebSocket route handlers yet, instead I check for a payload attribute and create responses inside the $default handler.
 - In order to persist the client connections and state of each connection, I write that information into DynamoDB. Then all changes are recorded and rebroadcast to the client.
 - The backend client doesn't use a typical Socket.io client or library, instead AWS requires a special API call to send data back to API Gateway which will route back to the client. Architect provides a helper function, [docs for that are here](https://arc.codes/primitives/ws)

Here's how it works: 

Let's look at the `.arc` file first, because it's the manifest that keeps all deployed assets and code in sync with my git repo.
```md
# .arc

# declare an app namespace for the CloudFormation stack
@app
cage-socket-arc

# creates a CloudFront distribution for your API Gateway endpoints.
@cdn

# declares a websocket interface on API Gateway
@ws

# declares an S3 bucket for static assets and client side JavaScript
@static
folder public
fingerprint true

# declare Lambda functions that listen for HTTP events
@http
get /
get /connections

# declare a DynamoDB table
@tables
data
  scopeID *String
  dataID **String
  ttl TTL

# declare AWS credentials
@aws
profile default
region us-east-1
```
This information will let us run [Sandbox](https://github.com/architect/sandbox), a local dev server that emulates most of the services that we're going to deploy. If you are curious about what the `.arc` file creates for you, run `arc deploy --dry-run` and it will package everything into a `sam.yaml` that you can inspect before doing an actual deploy. You will notice that each function and service is created with the least amount of IAM privileges. Resources are bound to the app namespace and Architect does the service discovery for you at runtime. `npm start` is a script in `package.json` which starts Architect's Sandbox.

The WebSockets API in the browser also have three events that you can add event handlers to:
- `ws.onopen`
- `ws.onclose`
- `ws.onmessage`

When a client first makes a request to the index route, the `src/http/get-index` handler is invoked and returns an HTML string of the DOM layout and serves the client-side JavaScript bundle from an S3 bucket that is set to serve public assets.

The page will load and start to initiate a WebSocket connection. When the connection request starts, a connectionId is passed to `src/ws/connect/index.js`, the `$connect` Lambda function handler. It will save the connectionId to Dynamo and return HTTP status 200 to upgrade the connection from HTTP to WSS. 

Once the connection upgrade is complete, the client-side JS will fetch all connections from a GET endpoint, `src/http/get-connections/index.js` and update the DOM with an image and set the unique ID based on all known `connectionId`s in the database. If there is a direction attribute, it will also grab those to set the initial client state.

A connection event is also sent over the socket connection to `src/ws/default/index.js`, the `$default` Lambda function handler, to trigger a new push of connections to existing clients. 

A message event is a button press to indicate a change in direction for the given `connectionId`. The change message is sent to `src/ws/default/index.js`, the $default Lambda function handler, where the database is updated and pushes another state change to every client.

The disconnect event sends a message to `src/ws/disconnect/index.js`, the $disconnect handler, where the connectionId is removed from the database and pushes the new state to the clients.

When you decide to deploy this code to AWS, run `arc deploy` from the terminal and make note of the WebSocket URL that is printed out in the console.

```bash
       App ⌁ cage-socket-arc
      Region ⌁ us-east-1
     Profile ⌁ default
     Version ⌁ Architect 6.4.0
         cwd ⌁ /Users/pchinjr/Code/cage-socket-arc

⚬ Deploy Initializing deployment
  | Stack ... CageSocketArcStaging
  | Bucket .. cage-socket-arc-cfn-deployments-80b66
✓ Deploy Static asset fingerpringing enabled
⚬ Hydrate Hydrating dependencies in 5 paths
✓ Hydrate Hydrated src/http/get-connections
  | npm ci: added 5 packages in 0.103s
✓ Hydrate Hydrated src/http/get-index
  | npm ci: added 17 packages in 0.248s
✓ Hydrate Hydrated src/ws/connect
  | npm ci: added 16 packages in 0.345s
✓ Hydrate Hydrated src/ws/default
  | npm ci: added 16 packages in 0.304s
✓ Hydrate Hydrated src/ws/disconnect
  | npm ci: added 16 packages in 0.328s
✓ Hydrate Hydrated app with static.json
✓ Success! Finished hydrating dependencies
⚬ Deploy Created deployment templates
✓ Deploy Generated CloudFormation deployment
✓ Deploy Deployed & built infrastructure
✓ Success! Deployed app in 45.097 seconds

    HTTP: https://dksrpkhw57rwf.cloudfront.net
      WS: wss://1bm7kk0nsb.execute-api.us-east-1.amazonaws.com/staging

⚬ Deploy Deploying static assets...
⚬ Deploy Deploying static assets...
[  Uploaded  ] https://cagesocketarcstaging-staticbucket-xxxxxxxxxxx.s3.us-east-1.amazonaws.com/static.json
[  Uploaded  ] https://cagesocketarcstaging-staticbucket-xxxxxxxxxxx.s3.us-east-1.amazonaws.com/index-069f5b4a5c.mjs
✓ Deploy Skipped 1 file (already up to date)
✓ Success! Deployed static assets from public/
```
You will need the `WS:` url to update `src/http/get-index/get-websocket-url.js` with the proper WebSocket endpoint for `staging` and `production`.

To deploy to production, run `arc deploy production`.

The data pretty much flows straight up and down in the diagram below. From the client to the db and back down with an active WebSocket connection and all of the logic is handled by the Lambdas registered to special WebSocket routes given by API Gateway.
![Cage-Socket Architecture](https://user-images.githubusercontent.com/10526646/84422202-abb9d100-abea-11ea-9562-1d2897970740.png)