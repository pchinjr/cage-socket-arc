# Cage Sockets

This is an interactive demo of serverless WebSockets using OpenJS Architect, AWS API Gateway, DynamoDB, and AWS Lambda functions. In December 2018, AWS announced that API Gateway had the ability to create WebSocket connections. 

You are given three routes at API Gateway to route to three special Lambda functions.
 - $connect
 - $disconnect
 - $default

Each message sent has a connectionId and whatever JSON payload you want to send to the Lambda function. Since the Lambda functions are stateless, we can use DynamoDB to persist the connectionId and state of the client. This entire world state is rebroadcast to all connections in the database with it's own attributes.

To use this example, you will need to have NodeJS, OpenJS Architect, and an AWS account with Admin privileges. Once deployed, your entire infrastructure is code defined by the `.arc` file. Each deploy will be deterministic with a full CloudFormation stack, except the CloudFront CDN, which still has to be deployed with the SDK, but Architect takes care of it. Just be patient as it may take a few minutes to resolve correctly. 

Clone this repo and then: 
```bash
npm install
npm start
```