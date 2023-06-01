const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const { MongoClient } = require('mongodb');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const mongoUrl = 'mongodb://localhost:27017';
const dbName = 'groupchat';
const collectionName = 'messages';

let db;

MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, (err, client) => {
  if (err) {
    console.error('Failed to connect to MongoDB:', err);
    return;
  }

  db = client.db(dbName);
  console.log('Connected to MongoDB');

  // Start the server after the database connection is established
  server.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
  });
});

// WebSocket connection
wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);

    switch (data.type) {
      case 'join':
        handleJoinRequest(data.groupName, data.groupPassword, ws);
        break;
      case 'message':
        handleChatMessage(data.message);
        break;
    }
  });
});

// Handle join request
function handleJoinRequest(groupName, groupPassword, ws) {
  const collection = db.collection(collectionName);

  collection.findOne({ name: groupName, password: groupPassword }, (err, result) => {
    if (err) {
      console.error('Failed to query the database:', err);
      return;
    }

    if (result) {
      ws.send(JSON.stringify({
        type: 'message',
        message: `Welcome to the "${groupName}" group!`,
      }));
    } else {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid group name or password.',
      }));
    }
  });
}

// Handle chat message
function handleChatMessage(message) {
  const collection = db.collection(collectionName);

  collection.insertOne({ message }, (err, result) => {
    if (err) {
      console.error('Failed to insert message into the database:', err);
      return;
    }

    wss.clients.forEach((client) => {
      client.send(JSON.stringify({
        type: 'message',
        message: result.ops[0].message,
      }));
    });
  });
}
