"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { useChatStore } from "@/lib/store";
import socketService from "@/lib/socket";

export default function TextChatPage() {
  const { 
    status, 
    messages, 
    strangerIsTyping,
    setStatus
  } = useChatStore();
  
  const [inputValue, setInputValue] = useState("");
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (status === 'connected') {
        socketService.disconnect();
      }
    };
  }, [status]);
  
  const startChat = () => {
    setStatus('searching');
    socketService.connect({ mode: 'text' });
  };
  
  const disconnectChat = () => {
    socketService.disconnect();
  };
  
  const sendMessage = () => {
    if (inputValue.trim() === "") return;
    
    // Send message via socket service
    socketService.sendMessage(inputValue);
    setInputValue("");
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    
    // Send typing indicator
    socketService.sendTypingStatus(true);
    
    // Clear previous timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set new timeout to stop typing indicator after 2 seconds
    const timeout = setTimeout(() => {
      socketService.sendTypingStatus(false);
    }, 2000);
    
    setTypingTimeout(timeout);
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="container mx-auto py-4 px-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" asChild className="mr-4">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Text Chat</h1>
        </div>
      </header>
      
      <main className="container mx-auto flex-1 flex flex-col p-4 max-w-4xl">
        {status === 'idle' ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <Card className="p-8 max-w-md w-full text-center">
              <h2 className="text-2xl font-bold mb-4">Start a Text Chat</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Click the button below to be matched with a random stranger for a text chat.
              </p>
              <Button size="lg" className="w-full rounded-xl" onClick={startChat}>
                Start Chatting
              </Button>
            </Card>
          </div>
        ) : status === 'searching' ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <h2 className="text-2xl font-bold mb-2">Looking for someone to chat with...</h2>
              <p className="text-slate-600 dark:text-slate-400">This won't take long.</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto mb-4 rounded-2xl bg-white dark:bg-slate-800 p-4 shadow-sm">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 ${
                    message.sender === "you" ? "text-right" : "text-left"
                  }`}
                >
                  <div
                    className={`inline-block rounded-2xl px-4 py-2 max-w-[80%] ${
                      message.sender === "you"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  >
                    <p>{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {message.sender === "you" && (
                        <span className="ml-2">
                          {message.seen ? "✓✓" : message.delivered ? "✓" : ""}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
              {strangerIsTyping && (
                <div className="text-left mb-4">
                  <div className="inline-block rounded-2xl px-4 py-2 bg-slate-200 dark:bg-slate-700">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
                className="rounded-xl"
              />
              <Button size="icon" onClick={sendMessage} className="rounded-xl">
                <Send className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="mt-4 flex justify-center">
              <Button variant="destructive" onClick={disconnectChat} className="rounded-xl">
                End Chat
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}