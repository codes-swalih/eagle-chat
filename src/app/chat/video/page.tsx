"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Video, VideoOff, Mic, MicOff } from "lucide-react";
import Link from "next/link";

export default function VideoChatPage() {
  const [connected, setConnected] = useState(false);
  const [searching, setSearching] = useState(false);
  const [messages, setMessages] = useState<{ text: string; sender: "you" | "stranger"; timestamp: Date }[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    // This would be replaced with actual WebRTC setup code
    if (connected && localVideoRef.current) {
      // Simulate local video with a placeholder
      localVideoRef.current.poster = "https://placehold.co/320x240/007bff/ffffff?text=Your+Camera";
    }
    
    if (connected && remoteVideoRef.current) {
      // Simulate remote video with a placeholder
      remoteVideoRef.current.poster = "https://placehold.co/640x480/cccccc/666666?text=Stranger's+Camera";
    }
  }, [connected]);
  
  const startChat = () => {
    setSearching(true);
    // Simulate finding a match after 3 seconds
    setTimeout(() => {
      setSearching(false);
      setConnected(true);
      setMessages([
        {
          text: "You're now in a video chat with a random stranger. Say hi!",
          sender: "stranger",
          timestamp: new Date(),
        },
      ]);
    }, 3000);
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
    
    // Simulate stranger response after 1-3 seconds
    setTimeout(() => {
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
  
  const toggleVideo = () => {
    setVideoEnabled(!videoEnabled);
  };
  
  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
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
          <h1 className="text-2xl font-bold">Video Chat</h1>
        </div>
      </header>
      
      <main className="container mx-auto flex-1 flex flex-col p-4 max-w-5xl">
        {!connected && !searching ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <Card className="p-8 max-w-md w-full text-center">
              <h2 className="text-2xl font-bold mb-4">Start a Video Chat</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Click the button below to be matched with a random stranger for a video chat.
              </p>
              <Button size="lg" className="w-full rounded-xl" onClick={startChat}>
                Start Video Chat
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
          <div className="flex-1 flex flex-col md:flex-row gap-4">
            <div className="md:w-2/3 flex flex-col">
              <div className="relative bg-black rounded-2xl overflow-hidden aspect-video">
                <video
                  ref={remoteVideoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted={false}
                ></video>
                <div className="absolute bottom-4 right-4 w-1/4 aspect-video bg-black rounded-xl overflow-hidden border-2 border-white">
                  <video
                    ref={localVideoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    muted
                  ></video>
                  {!videoEnabled && (
                    <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                      <VideoOff className="h-8 w-8 text-white" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant={videoEnabled ? "default" : "destructive"}
                  size="icon"
                  className="rounded-full h-12 w-12"
                  onClick={toggleVideo}
                >
                  {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </Button>
                <Button
                  variant={audioEnabled ? "default" : "destructive"}
                  size="icon"
                  className="rounded-full h-12 w-12"
                  onClick={toggleAudio}
                >
                  {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </Button>
                <Button
                  variant="destructive"
                  className="rounded-full h-12 px-4"
                  onClick={disconnectChat}
                >
                  End Chat
                </Button>
              </div>
            </div>
            
            <div className="md:w-1/3 flex flex-col">
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
            </div>
          </div>
        )}
      </main>
    </div>
  );
}