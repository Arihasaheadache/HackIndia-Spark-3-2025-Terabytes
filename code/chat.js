const SUPABASE_URL = "https://kjbpshbtznkftxxnlljl.supabase.co";
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY;
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUserId = null;
let selectedChatUserId = null;

// ✅ Load Current User ID
async function loadCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
        console.error("Error fetching user:", error);
        return;
    }
    currentUserId = user.id;
    loadChatList();
}

// ✅ Load Chat List (Including Self)
async function loadChatList() {
    if (!currentUserId) return;

    const { data, error } = await supabase
        .from("messages")
        .select("sender_id, receiver_id");

    if (error) {
        console.error("Error loading chats:", error);
        return;
    }

    const userIds = new Set();
    data.forEach(({ sender_id, receiver_id }) => {
        if (sender_id === currentUserId || receiver_id === currentUserId) {
            userIds.add(sender_id);
            userIds.add(receiver_id);
        }
    });

    // ✅ Add self-chat for testing
    userIds.add(currentUserId);

    updateChatList(userIds);
}

// ✅ Update Chat List UI
async function updateChatList(userIds) {
    const chatList = document.getElementById("chat-list");
    chatList.innerHTML = "";

    for (const userId of userIds) {
        if (!userId) continue;

        const { data: userData, error } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", userId)
            .single();

        if (error || !userData) continue;

        const li = document.createElement("li");
        li.textContent = userData.username + (userId === currentUserId ? " (You)" : "");
        li.dataset.userId = userId;
        li.addEventListener("click", () => selectChat(userId, userData.username));
        chatList.appendChild(li);
    }

    if (chatList.children.length === 0) {
        chatList.innerHTML = "<li>No chats available</li>";
    }
}

// ✅ Select a Chat
function selectChat(userId, username) {
    selectedChatUserId = userId;
    document.getElementById("chat-username").textContent = username;
    loadMessages();
}

// ✅ Load Messages
async function loadMessages() {
    if (!selectedChatUserId || !currentUserId) return;

    const { data, error } = await supabase
        .from("messages")
        .select("id, sender_id, receiver_id, message, created_at")
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Error loading messages:", error);
        return;
    }

    const chatMessages = document.getElementById("chat-messages");
    chatMessages.innerHTML = "";

    data.forEach(msg => {
        if (
            (msg.sender_id === currentUserId && msg.receiver_id === selectedChatUserId) ||
            (msg.sender_id === selectedChatUserId && msg.receiver_id === currentUserId)
        ) {
            const div = document.createElement("div");
            div.className = msg.sender_id === currentUserId ? "message sent" : "message received";
            div.textContent = msg.message;
            chatMessages.appendChild(div);
        }
    });

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ✅ Send a Message
async function sendMessage() {
    if (!selectedChatUserId || !currentUserId) {
        alert("Please select a chat before sending a message.");
        return;
    }

    const messageInput = document.getElementById("message");
    const message = messageInput.value.trim();
    if (!message) return;

    const { error } = await supabase.from("messages").insert([
        {
            sender_id: currentUserId,
            receiver_id: selectedChatUserId,
            message: message
        }
    ]);

    if (error) {
        console.error("Error sending message:", error);
        return;
    }

    messageInput.value = "";
    loadMessages();
}

document.getElementById("video-call").addEventListener("click", () => {
    const callUrl = "https://cb7c5062-0716-46e7-9fb0-117574cca640-00-3n4vd6rztolvd.pike.replit.dev/"; // Change to your video call link
    window.open(callUrl, "_blank");
});

// ✅ Event Listeners
document.addEventListener("DOMContentLoaded", loadCurrentUser);
document.getElementById("send-message").addEventListener("click", sendMessage);
