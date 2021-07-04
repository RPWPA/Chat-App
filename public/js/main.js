const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// Join chatroom
socket.emit('joinRoom', { username, room });

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
  
  // Changing the room's html. 
  roomName.innerText = room;
  
  // Displaying the users inside the current room. 
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
});

// Message from server
socket.on('message', (message) => {
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener('submit', (e) => {
  // default behavior of the submit is to send a form
  e.preventDefault();

  // Get message text
  let message = e.target.elements.msg.value;

  // Removing the extra spaces
  message = message.trim();

  // if the message is empty
  if (!message) {
    return false;
  }

  // Emit message to server
  socket.emit('chatMessage', message);

  // Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
  // Creating our message div. 
  const div = document.createElement('div');
  div.classList.add('message');

  // Adding the user and time of the message in the div
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerHTML = message.userName;
  p.innerHTML += `<span> ${message.time}</span>`;
  div.appendChild(p);
  
  // Adding the user content in the div
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
}


//Prompt the user before leave chat room
document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
  if (leaveRoom) {
    window.location = '../index.html';
  }
});
