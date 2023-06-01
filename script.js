// WebSocket connection
const socket = new WebSocket('ws://localhost:3000');

// DOM elements
const joinForm = document.getElementById('join-form');
const groupNameInput = document.getElementById('group-name');
const groupPasswordInput = document.getElementById('group-password');
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const messagesList = document.getElementById('messages-list');

// Join group
joinForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const groupName = groupNameInput.value;
  const groupPassword = groupPasswordInput.value;

  socket.send(JSON.stringify({
    type: 'join',
    groupName,
    groupPassword,
  }));

  groupNameInput.value = '';
  groupPasswordInput.value = '';
  joinForm.style.display = 'none';
  chatForm.style.display = 'block';
});

// Send message
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const message = messageInput.value;

  if (message.trim() !== '') {
    socket.send(JSON.stringify({
      type: 'message',
      message,
    }));

    messageInput.value = '';
  }
});

// Handle incoming messages
socket.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);

  switch (data.type) {
    case 'message':
      appendMessage(data.message);
      break;
    case 'error':
      appendErrorMessage(data.message);
      break;
  }
});

// Append new message to the chat
function appendMessage(message) {
  const li = document.createElement('li');
  li.textContent = message;
  messagesList.appendChild(li);
}

// Append error message to the chat
function appendErrorMessage(message) {
  const errorMessage = document.createElement('p');
  errorMessage.id = 'error-message';
  errorMessage.textContent = message;
  document.getElementById('chat-container').prepend(errorMessage);
}
