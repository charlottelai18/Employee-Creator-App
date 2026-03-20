import { useState, useRef, useEffect } from "react";
import "./ChatWidget.scss";

interface Message {
  role: "user" | "assistant";
  content: string;
  tools_used?: string[];
}

const MCP_URL = import.meta.env.VITE_MCP_URL || "http://localhost:3000";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your HR assistant. Ask me anything about your employees — like who's been here longest, highest paid staff, or search by name.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = { role: "user", content: trimmed };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const conversationHistory = updatedMessages.slice(1).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch(`${MCP_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          conversation_history: conversationHistory.slice(0, -1),
        }),
      });

      if (!res.ok) throw new Error("Failed to get response");

      const data = await res.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        tools_used: data.tools_used,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't connect to the HR assistant. Make sure the MCP server is running on port 3000.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessage = (content: string) => {
    // Convert basic markdown to readable text with line breaks
    return content
      .replace(/\*\*(.*?)\*\*/g, "$1") // strip bold markers for plain display
      .split("\n")
      .map((line, i) => (
        <span key={i}>
          {line}
          <br />
        </span>
      ));
  };

  return (
    <div className="chat-widget">
      {/* Floating button */}
      <button
        className={`chat-toggle-btn ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Toggle HR Assistant"
      >
        {isOpen ? (
          <i className="fa-solid fa-xmark" />
        ) : (
          <i className="fa-solid fa-comments" />
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="chat-panel">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-icon">
              <i className="fa-solid fa-robot" />
            </div>
            <div className="chat-header-text">
              <p className="chat-header-title">HR Assistant</p>
              <p className="chat-header-subtitle">Powered by Claude AI</p>
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-message ${msg.role}`}>
                <div className="message-bubble">
                  {formatMessage(msg.content)}
                </div>
                {msg.tools_used && msg.tools_used.length > 0 && (
                  <div className="tools-used">
                    <i className="fa-solid fa-wrench" />
                    {msg.tools_used.join(", ")}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="chat-message assistant">
                <div className="message-bubble loading-bubble">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chat-input-area">
            <textarea
              className="chat-input"
              placeholder="Ask about your employees..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={isLoading}
            />
            <button
              className="chat-send-btn"
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
            >
              <i className="fa-solid fa-paper-plane" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;