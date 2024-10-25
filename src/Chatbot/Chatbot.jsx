import React, { useState, useEffect } from "react";
import axios from "axios";
import chatbot from '../assets/chatbotao.png';
import avatarbot from '../assets/chatbot.png';
import iconchat from '../assets/icon-chat.svg';
import closechat from '../assets/close.svg';
import './ChatBot.css';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [isOpen, setIsOpen] = useState(false); // abrir e fechar o chat
  const [language, setLanguage] = useState("pt-BR"); // idioma padrão

  // Função para formatar a data
  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Função para formatar a hora
  const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const speak = (text, options = []) => {
    let fullText = text;
    
    if (options.length > 0) {
      fullText += ", " + options.join(", ");
    }

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = language; //define a linguagem com base no select
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const startChat = async () => {
      const today = new Date();
      setStartDate(formatDate(today)); // Define a data inicial da conversa
      const response = await axios.get("/api/chat/start");
      const initialMessage = response.data;
      initialMessage.timestamp = new Date();
      setMessages([initialMessage]);

      // Fala quando o chat for aberto
      if (isOpen) speak(initialMessage.content, initialMessage.options);
    };
    startChat();
  }, [isOpen]);

  const sendMessage = async (message) => {
    const userMessage = {
      content: message,
      type: "user",
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);

    const response = await axios.post("/api/chat", userMessage);
    const botMessage = { ...response.data, timestamp: new Date() };
    botMessage.options = response.data.options;

    setMessages((prevMessages) => [...prevMessages, botMessage]);

    // Fala a mensagem do bot com as opções, conforme o idioma selecionado
    if (isOpen) speak(botMessage.content, botMessage.options);
  };

  const colors = ["#10AAFD", "#007BC0", "#C535BC", "#00884A", "#18837E"];

  // Função para abrir e fechar o chat
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Função para mudar o idioma
  const changeLanguage = (e) => {
    setLanguage(e.target.value);
  };

  return (
    <>
      <select onChange={changeLanguage} value={language} className="language-select">
        <option value="pt-BR">Português</option>
        <option value="en-US">Inglês</option>
      </select>

      <div className={`chatbot-container ${isOpen ? 'open' : 'closed'}`}>
        <div className="chatbot-header bg-[#333333] w-full flex justify-center items-center h-[60px]">
          <img src={chatbot} alt="Chatbot" />
        </div>
        <div className="chatbot-content w-full h-full bg-[#2E3033]">
          <div className="messages-container">
            {startDate && (
              <div className="text-center mt-[40px] mb-[10px] text-gray-500">
                <p>{startDate}</p>
              </div>
            )}
            <div className="chatbot-messages">
              {messages.map((msg, index) => (
                <div className="flex flex-col" key={index}>
                  <div
                    className={`flex w-full items-end max-w-2xl w-[79%] ${msg.type === "user"
                      ? "ml-auto m-[10px] justify-end"
                      : "justify-start m-[10px]"
                      }`}
                  >
                    {msg.type === "bot" && (
                      <img
                        src={avatarbot}
                        alt="Avatar"
                        className="w-[12%] rounded-full mr-3"
                      />
                    )}

                    <div
                      className={`p-6 text-[16px] ${msg.type === "user"
                        ? "bg-[#10AAFD] text-white"
                        : "bg-[#4E5256] text-white"
                        }`}
                    >
                      <p>{msg.content}</p>

                      {msg.type === "bot" && msg.options && msg.options.length > 0 && (
                        <div className="mt-2">
                          {msg.options.map((option, index) => (
                            <button
                              key={index}
                              onClick={() => sendMessage(option)}
                              style={{
                                backgroundColor: colors[index % colors.length],
                                color: "white",
                                padding: "10px",
                                border: "none",
                                margin: "5px",
                              }}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={`text-right text-xs text-gray-400 mb-16 mr-16 ${msg.type === 'user' ? 'ml-auto' : ''}`}>
                    {msg.timestamp && formatTime(new Date(msg.timestamp))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-4 right-4 flex flex-col items-end">
        <button
          onClick={toggleChat}
          className="flex items-center justify-center w-12 h-12 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 focus:outline-none transition-all duration-300"
        >
          {isOpen ? (
            <img src={closechat} alt="" width={35} className="p-1" />
          ) : (
            <img src={iconchat} alt="" width={35} className="p-1" />
          )}
        </button>
      </div>
    </>
  );
}

export default Chat;
