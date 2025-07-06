import { useState, useEffect, useRef } from "react";
import { sendMessageToGemini } from "../services/geminiAPI";
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import logo from '/logo.png';

function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const newMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const reply = await sendMessageToGemini(input);
      setMessages((prev) => [...prev, { sender: "ai", text: reply }]);
    } catch (err) {
      console.error("Error sending message to Gemini:", err);
      const errorMessage = err.message.includes("API key not valid")
        ? "Error: Kunci API tidak valid. Pastikan kunci API sudah benar."
        : "Maaf, ada masalah saat merespons. Coba lagi nanti. 😔";
      setMessages((prev) => [...prev, { sender: "ai", text: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-screen min-h-screen bg-gradient-to-br from-sky-50 to-white text-gray-800">
      <header className="py-4 px-6 bg-white border-b border-gray-200 shadow-sm flex items-center justify-center gap-2">
        <img src={logo} alt="logo" className="w-10 h-10 rounded-full" />
        <h1 className="text-4xl font-bold text-sky-700 tracking-tight">Talky AI</h1>
      </header>
      <main className="flex-grow overflow-y-auto px-4 sm:px-8 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`rounded-xl px-5 py-3 max-w-[85%] text-base leading-relaxed shadow-md transition-all duration-300 whitespace-pre-line ${
                  msg.sender === "user"
                    ? "bg-sky-700 text-white rounded-br-none"
                    : "bg-gray-100 text-gray-900 rounded-bl-none"
                } ${msg.sender === "ai" ? 'prose prose-sm sm:prose lg:prose-base max-w-none' : ''}`}
              >
                {msg.sender === "ai"
                  ? <ReactMarkdown rehypePlugins={[rehypeRaw]}>{msg.text}</ReactMarkdown>
                  : msg.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-xl px-5 py-3 bg-gray-300 text-gray-700 animate-pulse">
                Sedang mengetik...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 px-4 sm:px-8 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-sky-700 focus:border-sky-700 transition-all text-sm bg-white text-gray-800 placeholder:text-gray-400"
            placeholder={isLoading ? "Mohon tunggu..." : "Tulis sesuatu..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="bg-sky-600 text-white text-sm px-5 py-2 rounded-full hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              "Kirim"
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}

export default ChatBot;
