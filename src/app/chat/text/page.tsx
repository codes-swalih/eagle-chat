"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";

export default function TextChatPage() {
  const [connected, setConnected] = useState(false);
  const [searching, setSearching] = useState(false);
  const [messages, setMessages] = useState<{ text: string; sender: "you" | "stranger"; timestamp: Date }[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [typing, setTyping] = useState(false);
  
  const startChat = () => {
    setSearching(true);
    // Simulate finding a match after 2 seconds
    setTimeout(() => {
      setSearching(false);
      setConnected(true);
      setMessages([
        {
          text: "You're now chatting with a random stranger. Say hi!",
          sender: "stranger",
          timestamp: new Date(),
        },
      ]);
    }, 2000);
  };
  
  const disconnectChat = () => {
    setConnected(false);
    setMessages([]);
  };
  
  const sendMessage = () => {
    if (inputValue.trim() === "") return;
    
    // Add user message
    const newMessage = {
      text: inputValue,
      sender: "you" as const,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
    
    // Simulate stranger typing
    setTyping(true);
    
    // Simulate stranger response after 1-3 seconds
    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          text: "This is a simulated response. In the real app, this would come from another user.",
          sender: "stranger",
          timestamp: new Date(),
        },
      ]);
    }, 1000 + Math.random() * 2000);
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
        {!connected && !searching ? (
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
        ) : searching ? (
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
              {messages.map((message, index) => (
                <div
                  key={index}
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
                    </p>
                  </div>
                </div>
              ))}
              {typing && (
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
                onChange={(e) => setInputValue(e.target.value)}
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