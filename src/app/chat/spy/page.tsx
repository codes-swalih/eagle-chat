"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";

export default function SpyModePage() {
  const [status, setStatus] = useState<'idle' | 'asking' | 'watching' | 'connected'>('idle');
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<{ text: string; sender: "stranger1" | "stranger2"; timestamp: Date }[]>([]);
  const [inputValue, setInputValue] = useState("");
  
  const startAsking = () => {
    if (!question.trim()) return;
    setStatus('asking');
    
    // Simulate finding strangers after 3 seconds
    setTimeout(() => {
      setStatus('connected');
      setMessages([
        {
          text: `Question: ${question}`,
          sender: "stranger1",
          timestamp: new Date(),
        },
        {
          text: "Hi there! Let's discuss this question.",
          sender: "stranger2",
          timestamp: new Date(),
        },
      ]);
    }, 3000);
  };
  
  const startWatching = () => {
    setStatus('watching');
    
    // Simulate finding a conversation after 3 seconds
    setTimeout(() => {
      setStatus('connected');
      const randomQuestions = [
        "What's your favorite movie of all time?",
        "Do you believe in aliens?",
        "What's the best place you've ever traveled to?",
        "If you could have any superpower, what would it be?",
        "What's your dream job?"
      ];
      const randomQuestion = randomQuestions[Math.floor(Math.random() * randomQuestions.length)];
      
      setMessages([
        {
          text: `Question: ${randomQuestion}`,
          sender: "stranger1",
          timestamp: new Date(),
        },
        {
          text: "That's an interesting question! I'd love to share my thoughts.",
          sender: "stranger2",
          timestamp: new Date(),
        },
      ]);
    }, 3000);
  };
  
  const disconnect = () => {
    setStatus('idle');
    setMessages([]);
    setQuestion("");
  };
  
  // Simulate conversation if connected
  useEffect(() => {
    if (status === 'connected') {
      const interval = setInterval(() => {
        const responses = [
          "I think that's a really good point.",
          "I disagree, actually. Here's why...",
          "I've never thought about it that way before.",
          "That's interesting! In my experience...",
          "I'm not sure I follow. Could you explain more?",
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        const sender = Math.random() > 0.5 ? "stranger1" : "stranger2";
        
        setMessages(prev => [
          ...prev,
          {
            text: randomResponse,
            sender,
            timestamp: new Date(),
          }
        ]);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [status]);
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="container mx-auto py-4 px-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" asChild className="mr-4">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Spy Mode</h1>
        </div>
      </header>
      
      <main className="container mx-auto flex-1 flex flex-col p-4 max-w-4xl">
        {status === 'idle' && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <Card className="p-8 max-w-md w-full text-center mb-6">
              <h2 className="text-2xl font-bold mb-4">Ask a Question</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Ask a question for two strangers to discuss while you watch.
              </p>
              <Input
                placeholder="Type your question..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="mb-4 rounded-xl"
              />
              <Button size="lg" className="w-full rounded-xl" onClick={startAsking}>
                Find Strangers
              </Button>
            </Card>
            
            <div className="text-center">
              <p className="mb-4">- OR -</p>
              <Button variant="outline" size="lg" className="rounded-xl" onClick={startWatching}>
                Watch a Discussion
              </Button>
            </div>
          </div>
        )}
        
        {status === 'asking' && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <h2 className="text-2xl font-bold mb-2">Finding strangers to discuss your question...</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">This won't take long.</p>
              <p className="font-medium">Your question: {question}</p>
            </div>
          </div>
        )}
        
        {status === 'watching' && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <h2 className="text-2xl font-bold mb-2">Finding an ongoing discussion...</h2>
              <p className="text-slate-600 dark:text-slate-400">This won't take long.</p>
            </div>
          </div>
        )}
        
        {status === 'connected' && (
          <div className="flex-1 flex flex-col">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 mb-4 shadow-sm">
              <h2 className="font-bold text-lg mb-2">
                {messages[0]?.text}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                You are watching two strangers discuss this question. You cannot participate in the conversation.
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto mb-4 rounded-2xl bg-white dark:bg-slate-800 p-4 shadow-sm">
              {messages.slice(1).map((message, index) => (
                <div
                  key={index}
                  className="mb-4"
                >
                  <div
                    className={`inline-block rounded-2xl px-4 py-2 max-w-[80%] ${
                      message.sender === "stranger1"
                        ? "bg-blue-600 text-white"
                        : "bg-purple-600 text-white"
                    }`}
                  >
                    <p className="text-xs font-medium mb-1">
                      {message.sender === "stranger1" ? "Stranger 1" : "Stranger 2"}
                    </p>
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
            </div>
            
            <div className="mt-4 flex justify-center">
              <Button variant="destructive" onClick={disconnect} className="rounded-xl">
                End Session
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}