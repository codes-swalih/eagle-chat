"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, X } from "lucide-react";
import Link from "next/link";

export default function InterestsChatPage() {
  const [connected, setConnected] = useState(false);
  const [searching, setSearching] = useState(false);
  const [messages, setMessages] = useState<{ text: string; sender: "you" | "stranger"; timestamp: Date }[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [interestInput, setInterestInput] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [typing, setTyping] = useState(false);
  const [matchedInterests, setMatchedInterests] = useState<string[]>([]);
  
  const addInterest = () => {
    if (!interestInput.trim()) return;
    if (interests.includes(interestInput.trim())) {
      setInterestInput("");
      return;
    }
    
    setInterests([...interests, interestInput.trim()]);
    setInterestInput("");
  };
  
  const removeInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };
  
  const startChat = () => {
    if (interests.length === 0) return;
    
    setSearching(true);
    
    // Simulate finding a match after 3 seconds
    setTimeout(() => {
      setSearching(false);
      setConnected(true);
      
      // Randomly select 1-3 interests to match on
      const numMatched = Math.min(interests.length, Math.floor(Math.random() * 3) + 1);
      const shuffled = [...interests].sort(() => 0.5 - Math.random());
      const matched = shuffled.slice(0, numMatched);
      setMatchedInterests(matched);
      
      setMessages([
        {
          text: `You've been matched with a stranger who shares your interest${matched.length > 1 ? 's' : ''} in: ${matched.join(', ')}`,
          sender: "stranger",
          timestamp: new Date(),
        },
      ]);
    }, 3000);
  };
  
  const disconnectChat = () => {
    setConnected(false);
    setMessages([]);
    setMatchedInterests([]);
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
      
      // Generate a response that sometimes references the matched interests
      let response = "This is a simulated response. In the real app, this would come from another user.";
      
      if (Math.random() > 0.7 && matchedInterests.length > 0) {
        const randomInterest = matchedInterests[Math.floor(Math.random() * matchedInterests.length)];
        const interestResponses = [
          `Speaking of ${randomInterest}, what got you interested in that?`,
          `I've been into ${randomInterest} for about 2 years now. How about you?`,
          `Do you have any recommendations related to ${randomInterest}?`,
          `What's your favorite thing about ${randomInterest}?`
        ];
        response = interestResponses[Math.floor(Math.random() * interestResponses.length)];
      }
      
      setMessages((prev) => [
        ...prev,
        {
          text: response,
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
          <h1 className="text-2xl font-bold">Interest-Based Chat</h1>
        </div>
      </header>
      
      <main className="container mx-auto flex-1 flex flex-col p-4 max-w-4xl">
        {!connected && !searching ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <Card className="p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4 text-center">Enter Your Interests</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6 text-center">
                You'll be matched with someone who shares similar interests.
              </p>
              
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Add an interest..."
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addInterest();
                  }}
                  className="rounded-xl"
                />
                <Button onClick={addInterest} className="rounded-xl">Add</Button>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {interests.map((interest, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1 text-sm">
                    {interest}
                    <button
                      onClick={() => removeInterest(interest)}
                      className="ml-2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {interests.length === 0 && (
                  <p className="text-sm text-slate-500 italic">No interests added yet</p>
                )}
              </div>
              
              <Button
                size="lg"
                className="w-full rounded-xl"
                onClick={startChat}
                disabled={interests.length === 0}
              >
                Find Match
              </Button>
            </Card>
          </div>
        ) : searching ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <h2 className="text-2xl font-bold mb-2">Looking for someone with similar interests...</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">This won't take long.</p>
              <div className="flex flex-wrap justify-center gap-2">
                {interests.map((interest, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1 text-sm">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 mb-4 shadow-sm">
              <h2 className="font-bold text-lg mb-2">Matched Interests</h2>
              <div className="flex flex-wrap gap-2">
                {matchedInterests.map((interest, index) => (
                  <Badge key={index} className="px-3 py-1 text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
            
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