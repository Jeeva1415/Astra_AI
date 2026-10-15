const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const messages = document.getElementById("messages");
const welcomeScreen = document.getElementById("welcomeScreen");
const chatArea = document.getElementById("chatArea");
const newChatBtn = document.getElementById("newChatBtn");
const recentChats = document.getElementById("recentChats");
const clearAllBtn = document.getElementById("clearAllBtn");

const STORAGE_KEY = "astra_ai_chats_v1";

let isGenerating = false;
let chats = loadChats();
let currentChatId = null;

// Load saved chats from browser storage
function loadChats() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error("Could not load chat history:", error);
        return [];
    }
}

// Save chats to browser storage
function saveChats() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
        renderRecentChats();
    } catch (error) {
        console.error("Could not save chat history:", error);
    }
}

// Create a new conversation
function createNewChat() {
    const chat = {
        id: Date.now().toString() + Math.random().toString(36).slice(2, 8),
        title: "New Chat",
        messages: [],
        updatedAt: Date.now()
    };

    chats.unshift(chat);
    currentChatId = chat.id;

    saveChats();
    renderMessages();
    messageInput.value = "";
    messageInput.style.height = "auto";
    messageInput.focus();
}

// Delete one conversation
function deleteChat(id) {
    if (isGenerating) return;

    chats = chats.filter(chat => chat.id !== id);

    // If the open chat was deleted, switch to the next one (or the welcome screen)
    if (currentChatId === id) {
        currentChatId = chats.length > 0 ? chats[0].id : null;
    }

    saveChats();
    renderMessages();
}

// Delete all conversations
function clearAllChats() {
    if (isGenerating || chats.length === 0) return;

    if (!confirm("Delete all chat history? This cannot be undone.")) return;

    chats = [];
    currentChatId = null;
    localStorage.removeItem(STORAGE_KEY);

    renderMessages();
    renderRecentChats();
}

// Get the currently selected conversation
function getCurrentChat() {
    return chats.find(chat => chat.id === currentChatId);
}

// Save a message in the selected conversation
function saveMessage(role, content) {
    const chat = getCurrentChat();

    if (!chat) return;

    chat.messages.push({ role, content });

    // Set the chat title using the first user message
    if (role === "user" && chat.title === "New Chat") {
        chat.title = content.length > 35
            ? content.slice(0, 35) + "..."
            : content;
    }

    chat.updatedAt = Date.now();

    // Move the active conversation to the top
    chats = [
        chat,
        ...chats.filter(item => item.id !== chat.id)
    ];

    saveChats();
}

// Display saved conversation messages
function renderMessages() {
    messages.innerHTML = "";

    const chat = getCurrentChat();
    const chatMessages = chat ? chat.messages : [];

    welcomeScreen.style.display =
        chatMessages.length === 0 ? "flex" : "none";

    chatMessages.forEach(item => {
        addMessage(item.role, item.content);
    });

    scrollToBottom();
}

// Display the sidebar chat list
function renderRecentChats() {
    if (!recentChats) return;

    recentChats.innerHTML = "";

    chats.forEach(chat => {
        const row = document.createElement("div");
        row.className = "recent-chat-row";

        const item = document.createElement("button");
        item.type = "button";
        item.className = "recent-chat-item";
        item.textContent = chat.title;
        item.title = chat.title;

        if (chat.id === currentChatId) {
            item.classList.add("active");
        }

        item.addEventListener("click", () => {
            if (isGenerating) return;

            currentChatId = chat.id;
            messageInput.value = "";
            messageInput.style.height = "auto";

            renderMessages();
            renderRecentChats();
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.className = "delete-chat";
        deleteBtn.textContent = "✕";
        deleteBtn.title = "Delete this chat";
        deleteBtn.setAttribute("aria-label", "Delete this chat");

        deleteBtn.addEventListener("click", event => {
            event.stopPropagation();
            deleteChat(chat.id);
        });

        row.appendChild(item);
        row.appendChild(deleteBtn);
        recentChats.appendChild(row);
    });
}

// Automatically resize the input
messageInput.addEventListener("input", () => {
    messageInput.style.height = "auto";
    messageInput.style.height =
        Math.min(messageInput.scrollHeight, 180) + "px";
});

// Press Enter to send; Shift + Enter creates a new line
messageInput.addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});

// Send button
sendButton.addEventListener("click", sendMessage);

// New Chat button
newChatBtn.addEventListener("click", () => {
    if (isGenerating) return;
    createNewChat();
});

// Clear all button
clearAllBtn.addEventListener("click", clearAllChats);

// Suggestion buttons
document.querySelectorAll(".suggestion").forEach(button => {
    button.addEventListener("click", () => {
        const prompt = button.dataset.prompt;
        if (!prompt || isGenerating) return;

        messageInput.value = prompt;
        messageInput.dispatchEvent(new Event("input"));
        sendMessage();
    });
});

// Send a message to Astra
async function sendMessage() {
    if (isGenerating) return;

    const text = messageInput.value.trim();
    if (!text) return;

    // Create a conversation if none is selected
    if (!getCurrentChat()) {
        createNewChat();
    }

    welcomeScreen.style.display = "none";

    messageInput.value = "";
    messageInput.style.height = "auto";

    // Save and display the user's message
    addMessage("user", text);
    saveMessage("user", text);

    const thinking = addThinkingMessage();

    isGenerating = true;
    sendButton.disabled = true;

    try {
        const response = await fetch(
            "http://127.0.0.1:8000/chat",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ message: text })
            }
        );

        if (!response.ok) {
            throw new Error("Server returned " + response.status);
        }

        const data = await response.json();
        thinking.remove();

        const answer = data.response || "Astra returned an empty response.";

        addMessage("assistant", answer);
        saveMessage("assistant", answer);

    } catch (error) {
        thinking.remove();

        const errorMessage =
            "Sorry, I couldn't connect to Astra's server. " +
            "Please make sure the backend is running.";

        addMessage("assistant", errorMessage);
        saveMessage("assistant", errorMessage);

        console.error("Astra API error:", error);

    } finally {
        isGenerating = false;
        sendButton.disabled = false;
        messageInput.focus();
        renderRecentChats();
    }
}

// Add a message to the chat screen
function addMessage(role, content) {
    const message = document.createElement("div");
    message.className = `message ${role}`;

    const avatar = role === "assistant" ? "✦" : "J";
    const name = role === "assistant" ? "Astra" : "You";

    const avatarElement = document.createElement("div");
    avatarElement.className = "message-avatar";
    avatarElement.textContent = avatar;

    const body = document.createElement("div");
    body.className = "message-body";

    const roleElement = document.createElement("div");
    roleElement.className = "message-role";
    roleElement.textContent = name;

    const contentElement = document.createElement("div");
    contentElement.className = "message-content";
    contentElement.innerHTML = formatMessage(content);

    body.appendChild(roleElement);
    body.appendChild(contentElement);

    message.appendChild(avatarElement);
    message.appendChild(body);

    messages.appendChild(message);
    scrollToBottom();
}

// Thinking animation
function addThinkingMessage() {
    const message = document.createElement("div");
    message.className = "message assistant";

    message.innerHTML = `
        <div class="message-avatar">✦</div>
        <div class="message-body">
            <div class="message-role">Astra</div>
            <div class="thinking-message">
                <span>Astra is thinking</span>
                <div class="thinking-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    `;

    messages.appendChild(message);
    scrollToBottom();

    return message;
}

// Format basic Markdown-style messages
function formatMessage(text) {
    if (!text) return "";

    let formatted = escapeHTML(String(text));

    formatted = formatted.replace(
        /```([\s\S]*?)```/g,
        "<pre><code>$1</code></pre>"
    );

    formatted = formatted.replace(
        /`([^`]+)`/g,
        "<code>$1</code>"
    );

    formatted = formatted.replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>"
    );

    formatted = formatted.replace(/\n/g, "<br>");

    return formatted;
}

// Escape HTML to safely display message content
function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// Scroll to the latest message
function scrollToBottom() {
    setTimeout(() => {
        chatArea.scrollTo({
            top: chatArea.scrollHeight,
            behavior: "smooth"
        });
    }, 50);
}

// Restore the most recent chat when the page opens
function initializeAstra() {
    if (chats.length > 0) {
        currentChatId = chats[0].id;
    }

    renderMessages();
    renderRecentChats();
}

initializeAstra();