const serverUrl = "ws://localhost:3333";
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
document.addEventListener("DOMContentLoaded", () => {
  let chatBox;
  let chatInput;
  let sendButton;
  let connectInput;
  let connectButton;
  chatBox = document.getElementById("chat-box");
  chatInput = document.getElementById("chat-input");
  sendButton = document.getElementById("send-button");
  connectInput = document.getElementById("connect-input");
  connectButton = document.getElementById("connect-button");

  const userUniqueId = prompt("Enter your unique ID:");
  const userKeys = {}; // Store other users' keys with their unique IDs

  const socket = new WebSocket(serverUrl);

  socket.addEventListener("open", (event) => {
    console.log("WebSocket connection established.");
    // socket.send(
    //   JSON.stringify({ type: "key_exchange_request", userId: userUniqueId })
    // );
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
      }
    } else if (data.type === "encrypted_message") {
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

  // ... (your existing script code) ...

  connectButton.addEventListener("click", () => {
    const targetUserId = connectInput.value;
    if (targetUserId && targetUserId !== userUniqueId) {
      socket.send(
        JSON.stringify({
          type: "key_exchange_request",
          userId: targetUserId,
          key: aesKey,
        })
      );
    }
    connectInput.value = "";
  });
});
