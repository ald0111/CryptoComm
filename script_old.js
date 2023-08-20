// Replace with your actual WebSocket server URL
const serverUrl = "ws://localhost:3333";

const chatBox = document.getElementById("chat-box");
const chatInput = document.getElementById("chat-input");
const sendButton = document.getElementById("send-button");

// Generate a random AES key for encryption (simplified example)
// const aesKey = crypto.getRandomValues(new Uint8Array(16));
let aesKey = null;
// Check if the browser supports the Web Crypto API
if (window.crypto && window.crypto.subtle) {
  // Define the key configuration
  const keyConfig = {
    name: "AES-GCM", // Algorithm name (you can use other algorithms as well)
    length: 256, // Key length in bits
  };

  // Generate the random key
  window.crypto.subtle
    .generateKey(keyConfig, true, ["encrypt", "decrypt"])
    .then((cryptoKeyPair) => {
      console.log("Random CryptoKey pair generated:", cryptoKeyPair);
      aesKey = cryptoKeyPair;
      // Now you have the CryptoKey object(s) in cryptoKeyPair
    })
    .catch((error) => {
      console.error("Error generating CryptoKey:", error);
    });
} else {
  console.error("Web Crypto API is not supported in this browser.");
}

// Establish WebSocket connection
const socket = new WebSocket(serverUrl);

socket.addEventListener("open", (event) => {
  console.log("WebSocket connection established.");
});

socket.addEventListener("message", (event) => {
  const encryptedMessage = JSON.parse(event.data);
  const decryptedMessage = decryptMessage(encryptedMessage, aesKey);
  displayMessage(decryptedMessage);
});

sendButton.addEventListener("click", () => {
  const message = chatInput.value;
  if (message) {
    const encryptedMessage = encryptMessage(message, aesKey);
    encryptedMessage.then((result) => {
      socket.send(JSON.stringify(result));
      console.log(result);
    });
    // socket.send(encryptedMessage);
    chatInput.value = "";
  }
});

function encryptMessage(message, key) {
  const textEncoder = new TextEncoder();
  const encodedMessage = textEncoder.encode(message);
  const encryptedData = crypto.subtle.encrypt(
    { name: "AES-GCM", iv: new Uint8Array(12) },
    key,
    encodedMessage
  );
  return encryptedData;
}

function decryptMessage(encryptedData, key) {
  return crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(12) },
    key,
    encryptedData
  );
}

function displayMessage(message) {
  const textDecoder = new TextDecoder();
  const decodedMessage = textDecoder.decode(message);
  const messageElement = document.createElement("p");
  messageElement.textContent = decodedMessage;
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
}
