const serverUrl = "ws://localhost:3333";

const chatBox = document.getElementById("chat-box");
const chatInput = document.getElementById("chat-input");
const sendButton = document.getElementById("send-button");
const connectInput = document.getElementById("connect-input");
const connectButton = document.getElementById("connect-button");
const targetUserIdInput = document.getElementById("target-user-id");
const requestKeyExchangeButton = document.getElementById(
  "request-key-exchange"
);
const availableKeysList = document.getElementById("available-keys-list");

const userUniqueId = prompt("Enter your unique ID:");
const userKeys = {}; // Store other users' keys with their unique IDs

const socket = new WebSocket(serverUrl);

socket.addEventListener("open", (event) => {
  console.log("WebSocket connection established.");
});

socket.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "key_exchange_response" && data.userId !== userUniqueId) {
    const consent = confirm(
      `User ${data.userId} wants to exchange keys. Do you agree?`
    );
    if (consent) {
      userKeys[data.userId] = data.key;
      console.log(`Keys exchanged with user ${data.userId}.`);
      updateKeyAvailability();
    }
  } else if (data.type === "encrypted_message" && userKeys[data.senderId]) {
    const decryptedMessage = decryptMessage(
      data.message,
      userKeys[data.senderId]
    );
    displayMessage(`${data.senderId}: ${decryptedMessage}`);
  }
});

sendButton.addEventListener("click", () => {
  const message = chatInput.value;
  if (message) {
    const encryptedMessage = encryptMessage(message, userKeys);
    socket.send(
      JSON.stringify({ type: "encrypted_message", message: encryptedMessage })
    );
    chatInput.value = "";
  }
});

connectButton.addEventListener("click", () => {
  const targetUserId = connectInput.value;
  if (targetUserId && targetUserId !== userUniqueId) {
    socket.send(
      JSON.stringify({ type: "key_exchange_request", userId: targetUserId })
    );
  }
  connectInput.value = "";
});

requestKeyExchangeButton.addEventListener("click", () => {
  const targetUserId = targetUserIdInput.value;
  if (targetUserId && targetUserId !== userUniqueId) {
    socket.send(
      JSON.stringify({ type: "key_exchange_request", userId: targetUserId })
    );
  }
  targetUserIdInput.value = "";
});

function encryptMessage(message, keys) {
  const encryptedMessages = {};
  for (const userId in keys) {
    const key = keys[userId];
    const textEncoder = new TextEncoder();
    const encodedMessage = textEncoder.encode(message);
    const encryptedData = crypto.subtle.encrypt(
      { name: "AES-GCM", iv: new Uint8Array(12) },
      key,
      encodedMessage
    );
    encryptedMessages[userId] = encryptedData;
  }
  return encryptedMessages;
}

function decryptMessage(encryptedData, key) {
  const decryptedMessage = crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(12) },
    key,
    encryptedData
  );
  const textDecoder = new TextDecoder();
  return textDecoder.decode(decryptedMessage);
}

function displayMessage(message) {
  const messageElement = document.createElement("p");
  messageElement.textContent = message;
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function updateKeyAvailability() {
  availableKeysList.innerHTML = "";
  for (const userId in userKeys) {
    const listItem = document.createElement("li");
    listItem.textContent = userId;
    availableKeysList.appendChild(listItem);
  }
}

updateKeyAvailability();
