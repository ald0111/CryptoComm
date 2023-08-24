const serverUrl = "ws://" + window.location.hostname + ":3333";

const chatBox = document.getElementById("chat-box");
const hashBox = document.getElementById("hash-box");
const chatInput = document.getElementById("chat-input");
const sendButton = document.getElementById("send-button");
const connectInput = document.getElementById("connect-input");
const connectButton = document.getElementById("connect-button");
const targetUserIdInput = document.getElementById("target-user-id");
const requestKeyExchangeButton = document.getElementById(
  "request-key-exchange"
);
const availableKeysList = document.getElementById("available-keys-list");
const username = document.getElementById("username");

const userUniqueId = prompt("Enter your unique ID:");
const userKeys = {}; // Store other users' keys with their unique IDs
username.innerText = userUniqueId.toUpperCase();

const socket = new WebSocket(serverUrl);

const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function generateString(length) {
  let result = " ";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}
const myKey = generateString(50);

socket.addEventListener("open", (event) => {
  console.log("WebSocket connection established.");
});

socket.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);
  console.log(data);
  if (data.type === "key_exchange_request" && data.targetId == userUniqueId) {
    console.log("hiiiiii");
    let consent = false;
    if (data.handshake == "ACK") {
      if (data.targetId == userUniqueId) {
        consent = true;
      }
    } else {
      consent = confirm(
        `User ${data.userId} wants to exchange keys. Do you agree?`
      );
    }
    if (consent) {
      userKeys[data.userId] = data.userKey;
      console.log(`Keys exchanged with user ${data.userId}.`);
      if (data.handshake == "SYN") {
        socket.send(
          JSON.stringify({
            type: "key_exchange_request",
            targetId: data.userId,
            userId: userUniqueId,
            userKey: myKey,
            handshake: "ACK",
          })
        );
      }
      updateKeyAvailability();
    }
    //   } else if (data.type === "encrypted_message" && userKeys[data.senderId]) {
  } else if (data.type === "encrypted_message" && userKeys[data.uId]) {
    const decryptedMessage = decryptMessage(data.message, userKeys[data.uId]);
    console.log(decryptedMessage);
    displayMessage(`${data.uId}: ${decryptedMessage}`);
    displayHashMessage(`${data.uId}: ${data.message}`);

    // displayMessage(`${data.senderId}: ${decryptedMessage}`);
  } else if (data.type === "encrypted_message") {
    displayHashMessage(`${data.uId}: ${data.message}`);
  }
});

sendButton.addEventListener("click", () => {
  const message = chatInput.value;
  if (message) {
    // const encryptedMessage = encryptMessage(message, myKey);
    const encryptedMessage = CryptoJS.AES.encrypt(message, myKey);
    displayMessage(`${userUniqueId}: ${message}`);
    displayHashMessage(`${userUniqueId}: ${encryptedMessage.toString()}`);

    let mm = JSON.stringify({
      type: "encrypted_message",
      uId: userUniqueId,
      message: encryptedMessage.toString(),
    });
    console.log(mm);
    socket.send(mm);
    chatInput.value = "";
  }
});

requestKeyExchangeButton.addEventListener("click", () => {
  const targetUserId = targetUserIdInput.value;
  if (targetUserId && targetUserId !== userUniqueId) {
    socket.send(
      JSON.stringify({
        type: "key_exchange_request",
        targetId: targetUserId,
        userId: userUniqueId,
        userKey: myKey,
        handshake: "SYN",
      })
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
  const decryptedMessage = CryptoJS.AES.decrypt(encryptedData, key);
  console.log(decryptedMessage.toString(CryptoJS.enc.Utf8));
  return decryptedMessage.toString(CryptoJS.enc.Utf8);
}

function displayMessage(message) {
  const messageElement = document.createElement("p");
  messageElement.textContent = message;
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function displayHashMessage(message) {
  const messageElement = document.createElement("p");
  messageElement.textContent = message;
  hashBox.appendChild(messageElement);
  hashBox.scrollTop = hashBox.scrollHeight;
}

function updateKeyAvailability() {
  availableKeysList.innerHTML = "";
  for (const userId in userKeys) {
    const listItem = document.createElement("li");
    listItem.textContent = userId.toUpperCase();
    availableKeysList.appendChild(listItem);
  }
}

updateKeyAvailability();
