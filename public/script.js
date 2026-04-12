// DOM Elements
const chatModal = document.getElementById('chatModal');
const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');
const chatForm = document.getElementById('chatForm');

// Menyimpan riwayat percakapan
const conversation = [];

// Open Chat
function openChat() {
  chatModal.classList.add('active');
  userInput.focus();
}

// Close Chat
function closeChat() {
  chatModal.classList.remove('active');
  chatContainer.classList.remove('maximized');
  maximizeBtn.textContent = '⛶';
}

// Toggle Maximize
const chatContainer = document.querySelector('.chat-container');
const maximizeBtn = document.getElementById('maximizeBtn');

function toggleMaximize() {
  chatContainer.classList.toggle('maximized');
  
  // Update button icon
  if (chatContainer.classList.contains('maximized')) {
    maximizeBtn.textContent = '↙';
    maximizeBtn.title = 'Kecilkan chat';
  } else {
    maximizeBtn.textContent = '⛶';
    maximizeBtn.title = 'Perbesar chat';
  }
}

// Close modal when clicking outside
chatModal.addEventListener('click', function (e) {
  if (e.target === chatModal) {
    closeChat();
  }
});

// Handle form submission
chatForm.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  // Append user message to chat
  appendMessage('user', userMessage);
  userInput.value = '';

  // Add to conversation history
  conversation.push({
    role: 'user',
    text: userMessage
  });

  // Show loading state
  const loadingMsg = appendMessage('bot', 'Sedang berpikir... ⏳');

  try {
    // Send request to backend
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ conversation }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const botMessage = data.result;

    // Remove loading message
    if (loadingMsg) {
      loadingMsg.remove();
    }

    // Add bot response to conversation history
    conversation.push({
      role: 'model',
      text: botMessage
    });

    // Display bot response
    appendMessage('bot', botMessage);
  } catch (error) {
    console.error('Error:', error);

    // Remove loading message
    if (loadingMsg) {
      loadingMsg.remove();
    }

    appendMessage('bot', '❌ Maaf, terjadi kesalahan saat menghubungi server. Pastikan backend sedang berjalan di http://localhost:3000');
  }
});

// Append message to chat box
function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);

  // Render markdown for bot messages, plain text for user
  if (sender === 'bot') {
    msg.innerHTML = marked.parse(text);
  } else {
    msg.textContent = text;
  }

  chatBox.appendChild(msg);

  // Auto scroll to bottom
  setTimeout(() => {
    chatBox.scrollTop = chatBox.scrollHeight;
  }, 100);

  return msg;
}

// Welcome message on page load
window.addEventListener('load', function () {
  console.log('Travelista App loaded successfully!');
  console.log('Click the "Tanyakan ke AI Travel Agent" button to start chatting.');
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href !== '#' && !href.includes('card-link')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  });
});
