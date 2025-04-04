"use client"
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">Eagle</h1>
          
          {/* Mobile menu button */}
          <button 
            className="sm:hidden p-2 text-slate-700 dark:text-slate-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
          
          {/* Desktop navigation */}
          <nav className="hidden sm:flex space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/about">About</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/privacy">Privacy</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/terms">Terms</Link>
            </Button>
          </nav>
        </div>
        
        {/* Mobile navigation */}
        {isMenuOpen && (
          <nav className="sm:hidden mt-4 flex flex-col space-y-2 border-t pt-4 border-slate-200 dark:border-slate-700">
            <Button variant="ghost" className="justify-start" asChild>
              <Link href="/about">About</Link>
            </Button>
            <Button variant="ghost" className="justify-start" asChild>
              <Link href="/privacy">Privacy</Link>
            </Button>
            <Button variant="ghost" className="justify-start" asChild>
              <Link href="/terms">Terms</Link>
            </Button>
          </nav>
        )}
      </header>

      <main className="container mx-auto flex-1 flex flex-col items-center justify-center py-12 px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Talk to Strangers!</h2>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Connect with random people from around the world for text or video chats.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          <Card className="shadow-md hover:shadow-lg transition-shadow rounded-2xl">
            <CardHeader>
              <CardTitle>Text Chat</CardTitle>
              <CardDescription>Chat anonymously with strangers via text</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full rounded-xl" size="lg" asChild>
                <Link href="/chat/text">Start Text Chat</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow rounded-2xl">
            <CardHeader>
              <CardTitle>Video Chat</CardTitle>
              <CardDescription>Meet strangers face to face via video</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full rounded-xl" size="lg" asChild>
                <Link href="/chat/video">Start Video Chat</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-12 max-w-2xl text-center">
          <h3 className="text-2xl font-semibold mb-4">Special Modes</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="outline" className="rounded-xl" asChild>
              <Link href="/chat/spy">Spy Mode</Link>
            </Button>
            <Button variant="outline" className="rounded-xl" asChild>
              <Link href="/chat/interests">Chat with Interests</Link>
            </Button>
            <Button variant="outline" className="rounded-xl" asChild>
              <Link href="/chat/language">Language Selection</Link>
            </Button>
          </div>
        </div>
      </main>

      <footer className="container mx-auto py-6 text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} Eagle. All rights reserved.</p>
      </footer>
    </div>
  );
}
