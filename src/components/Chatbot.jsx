import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Chatbot() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const messagesEndRef = useRef(null);

    // 🔹 Auto-scroll
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, loading, isOpen]);

    // 🔹 Call backend
    const sendMessage = async (message) => {
        const res = await fetch("https://mujconnect-3lj9.onrender.com/api/chat", {
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
    const handleSend = async (customText) => {
        const text = customText || input;
        if (!text.trim()) return;

        const userMsg = { sender: "user", text };
        setMessages((prev) => [...prev, userMsg]);

        setInput("");
        setLoading(true);

        try {
            const res = await fetch("http://localhost:5000/api/providers", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ service: text })
            });

            const data = await res.json();
            let providers = data.providers || [];

            let botReply = "";

            if (providers.length > 0) {
                botReply = `Here are providers for "${text}" 👇`;
            } else {
                botReply = `No providers found for "${text}" in database. Showing a dummy provider for testing:`;
                providers = [{
                    name: "John Doe (Demo Provider)",
                    phone: "+91 9876543210",
                    area: "Central City",
                    services: [
                        { name: "General Service", price: "500" }
                    ]
                }];
            }

            setMessages((prev) => [
                ...prev,
                {
                    sender: "bot",
                    text: botReply,
                    providers: providers
                }
            ]);

        } catch (err) {
            console.error(err);
        }

        setLoading(false);
    };




    return (
        <>
            <style>{`
                @keyframes slideUpFadeIn {
                    from { opacity: 0; transform: translateY(20px); scale: 0.95; }
                    to { opacity: 1; transform: translateY(0); scale: 1; }
                }
            `}</style>

            {/* Floating Button */}
            {!isOpen && (
                <button 
                    style={styles.floatingBtn}
                    onClick={() => setIsOpen(true)}
                >
                    💬
                </button>
            )}

            {/* Chatbot Popup */}
            {isOpen && (
                <div style={styles.container}>
                    <div style={styles.header}>
                        <h3 style={{ margin: 0 }}>FixIt Assistant 🛠️</h3>
                        <button onClick={() => setIsOpen(false)} style={styles.closeBtn}>✖</button>
                    </div>

                    <div style={styles.chatBox}>
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                style={{
                                    ...styles.message,
                                    alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                                    backgroundColor: msg.sender === "user" ? "#4CAF50" : "#f1f1f1",
                                    color: msg.sender === "user" ? "white" : "black",
                                    borderRadius: "20px"
                                }}
                            >
                                {msg.text}

                                {msg.providers && msg.providers.length > 0 && (
                                    <div style={{ marginTop: "8px" }}>
                                        {msg.providers.map((p, i) => (
                                            <div key={i} style={styles.card}>
                                                <strong>{p.name}</strong>
                                                <p>📍 {p.area}</p>
                                                <p>📞 {p.phone}</p>

                                                {p.services.map((s, idx) => (
                                                    <p key={idx}>• {s.name}</p>
                                                ))}

                                                <button
                                                    style={styles.bookBtn}
                                                    onClick={() => {
                                                        const cat = (p.category || "").toLowerCase();
                                                        let path = "/user/dashboard";
                                                        if (cat.includes("women")) path = "/services?category=women";
                                                        else if (cat.includes("men")) path = "/services?category=men";
                                                        else if (cat.includes("repair")) path = "/services?category=repair";
                                                        else if (cat.includes("clean")) path = "/services?category=cleaning";
                                                        else if (cat.includes("paint")) path = "/services?category=painting";
                                                        else if (cat.includes("pest")) path = "/services?category=pest-control";
                                                        else if (cat.includes("water") || cat.includes("tank")) path = "/services?category=water-tank";
                                                        else if (cat.includes("plumb")) path = "/services?category=repair";
                                                        else if (cat.includes("electric")) path = "/services?category=repair";

                                                        // Close chatbot if possible, or just navigate
                                                        setIsOpen(false);
                                                        navigate(path);
                                                    }}
                                                >
                                                    Book Now
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {loading && (
                            <div style={{ fontStyle: "italic", color: "gray", fontSize: "14px", padding: "10px" }}>
                                Bot is typing...
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* ✅ FOOTER */}
                    <div style={styles.footer}>
                        <div style={styles.quickReplies}>
                            {["Salon", "Repair", "Cleaning", "Painting", "Pest Control", "Water Tank"].map((q, i) => (
                                <button key={i} style={styles.quickBtn} onClick={() => handleSend(q)}>
                                    {q}
                                </button>
                            ))}
                        </div>

                        <div style={styles.inputArea}>
                            <input
                                style={styles.input}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask about services..."
                            />
                            <button style={styles.button} onClick={() => handleSend()}>
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );


}

// 🎨 Styles
const styles = {
    floatingBtn: {
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        backgroundColor: "#4CAF50",
        color: "white",
        fontSize: "28px",
        border: "none",
        cursor: "pointer",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        transition: "transform 0.2s",
    },
    container: {
        width: "320px",
        height: "450px",
        border: "1px solid #ddd",
        borderRadius: "15px",
        padding: "0",
        position: "fixed",
        bottom: "90px", // Appears just above the floating button
        right: "20px",
        backgroundColor: "white",
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        display: "flex",
        flexDirection: "column",
        zIndex: 10000,
        animation: "slideUpFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        overflow: "hidden"
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 16px",
        backgroundColor: "#f8f9fa",
        borderBottom: "1px solid #eee",
        borderTopLeftRadius: "15px",
        borderTopRightRadius: "15px",
    },
    closeBtn: {
        background: "none",
        border: "none",
        fontSize: "16px",
        cursor: "pointer",
        color: "#666",
        padding: "4px"
    },
    chatBox: {
        flex: 1, // ✅ takes remaining space
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        padding: "16px",
        backgroundColor: "#fafafa"
    },
    message: {
        padding: "10px 14px",
        maxWidth: "85%",
        fontSize: "14px",
        lineHeight: "1.4"
    },
    footer: {
        borderTop: "1px solid #eee",
        padding: "12px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        backgroundColor: "white"
    },
    inputArea: {
        display: "flex",
        gap: "8px"
    },
    input: {
        flex: 1,
        padding: "10px",
        borderRadius: "8px",
        border: "1px solid #ccc",
        fontSize: "14px",
        outline: "none"
    },
    button: {
        padding: "8px 16px",
        borderRadius: "8px",
        cursor: "pointer",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        fontWeight: "bold"
    },
    quickReplies: {
        display: "flex",
        flexWrap: "wrap",
        gap: "6px",
        marginBottom: "4px"
    },
    quickBtn: {
        padding: "6px 12px",
        borderRadius: "20px",
        border: "1px solid #ddd",
        backgroundColor: "#fff",
        cursor: "pointer",
        fontSize: "12px",
        transition: "background 0.2s",
        color: "#333"
    },
    serviceBtn: {
        margin: "3px",
        padding: "4px 6px",
        borderRadius: "8px",
        border: "none",
        backgroundColor: "#d0ebff",
        cursor: "pointer",
        fontSize: "12px"
    },
    card: {
        background: "#fff",
        padding: "12px",
        borderRadius: "10px",
        marginTop: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        border: "1px solid #eee"
    },

    bookBtn: {
        marginTop: "10px",
        padding: "8px",
        width: "100%",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "bold"
    }
};