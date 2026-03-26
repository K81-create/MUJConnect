import { useState } from "react";

export default function Chatbot() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    // 🔹 Call backend
    const sendMessage = async (message) => {
        const res = await fetch("http://localhost:5000/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message })
        });

        const data = await res.json();
        return data.reply;
    };

    // 🔹 Handle send
    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { sender: "user", text: input };
        setMessages((prev) => [...prev, userMsg]);

        setLoading(true);

        const reply = await sendMessage(input);

        const botMsg = { sender: "bot", text: reply };
        setMessages((prev) => [...prev, botMsg]);

        setInput("");
        setLoading(false);
    };

    return (
        <div style={styles.container}>
            <h3>AI Assistant 🤖</h3>

            <div style={styles.chatBox}>
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        style={{
                            ...styles.message,
                            alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                            backgroundColor: msg.sender === "user" ? "#4CAF50" : "#eee",
                            color: msg.sender === "user" ? "white" : "black"
                        }}
                    >
                        {msg.text}
                    </div>
                ))}

                {loading && <p>Bot is typing...</p>}
            </div>

            <div style={styles.inputArea}>
                <input
                    style={styles.input}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about services..."
                />
                <button style={styles.button} onClick={handleSend}>
                    Send
                </button>
            </div>
        </div>
    );
}

// 🔹 Simple styling
const styles = {
    container: {
        width: "300px",
        border: "1px solid #ccc",
        borderRadius: "10px",
        padding: "10px",
        position: "fixed",
        bottom: "20px",
        right: "20px",
        backgroundColor: "white"
    },
    chatBox: {
        height: "300px",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        marginBottom: "10px"
    },
    message: {
        padding: "8px",
        borderRadius: "10px",
        maxWidth: "80%"
    },
    inputArea: {
        display: "flex",
        gap: "5px"
    },
    input: {
        flex: 1,
        padding: "5px"
    },
    button: {
        padding: "5px 10px",
        cursor: "pointer"
    }
};