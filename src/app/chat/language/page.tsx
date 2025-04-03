"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function LanguageSelectionPage() {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [chatType, setChatType] = useState<"text" | "video">("text");
  
  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "pt", name: "Portuguese" },
    { code: "ru", name: "Russian" },
    { code: "ja", name: "Japanese" },
    { code: "zh", name: "Chinese" },
    { code: "ar", name: "Arabic" },
    { code: "hi", name: "Hindi" },
  ];
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="container mx-auto py-4 px-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" asChild className="mr-4">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Language Selection</h1>
        </div>
      </header>
      
      <main className="container mx-auto flex-1 flex flex-col items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-center">Choose Your Language</h2>
          
          <div className="mb-8">
            <label className="block text-sm font-medium mb-2">
              Preferred Language
            </label>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-full rounded-xl">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((language) => (
                  <SelectItem key={language.code} value={language.code}>
                    {language.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-slate-500 mt-2">
              You'll be matched with users who speak this language.
            </p>
          </div>
          
          <div className="mb-8">
            <label className="block text-sm font-medium mb-2">
              Chat Type
            </label>
            <RadioGroup value={chatType} onValueChange={(value) => setChatType(value as "text" | "video")}>
              <div className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value="text" id="text" />
                <Label htmlFor="text">Text Chat</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="video" id="video" />
                <Label htmlFor="video">Video Chat</Label>
              </div>
            </RadioGroup>
          </div>
          
          <Button
            size="lg"
            className="w-full rounded-xl"
            asChild
          >
            <Link href={`/chat/${chatType}?lang=${selectedLanguage}`}>
              Start Chatting
            </Link>
          </Button>
        </Card>
      </main>
    </div>
  );
}