"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Bot,
  User,
  Send,
  Loader2,
  Sparkles,
  ExternalLink,
  Calendar,
  Users,
  Search,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ReferenceCardItem } from "@/lib/assistant/router";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  references?: ReferenceCardItem[];
  timestamp?: Date | string;
}

const STARTER_PROMPTS = [
  "AI events this week",
  "Find hackathon teams",
  "Find lost headphones",
  "Opportunities for Python",
];

export function AIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load existing conversation on mount
  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch("/api/assistant/chat");
        const data = await res.json();
        if (res.ok && data.conversation) {
          setConversationId(data.conversation._id);
          const historyMessages: ChatMessage[] = data.conversation.messages.map(
            (m: any, idx: number) => ({
              id: `history-${idx}`,
              role: m.role,
              content: m.content,
              timestamp: m.timestamp,
            })
          );
          setMessages(historyMessages);
        }
      } catch (e) {
        console.error("Failed to load chat history:", e);
      }
    }
    loadHistory();
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const queryText = (textToSend || inputMessage).trim();
    if (!queryText || isLoading) return;

    const userMessageId = `msg-${Date.now()}`;
    const newMessages: ChatMessage[] = [
      ...messages,
      { id: userMessageId, role: "user", content: queryText },
    ];

    setMessages(newMessages);
    setInputMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: queryText,
          conversationId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to get AI reply");
      }

      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      const assistantMsg: ChatMessage = {
        id: `reply-${Date.now()}`,
        role: "assistant",
        content: data.reply,
        references: data.references || [],
      };

      setMessages([...newMessages, assistantMsg]);
    } catch (err: any) {
      setMessages([
        ...newMessages,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "Sorry, I encountered an error answering your question. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[78vh] bg-card/60 border-border backdrop-blur-2xl overflow-hidden shadow-2xl">
      {/* Messages Header */}
      <div className="p-4 border-b border-border/60 bg-accent/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-md">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
              <span>Friday</span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-indigo-500/30 text-indigo-400">
                Grounded
              </Badge>
            </h3>
            <p className="text-[11px] text-muted-foreground">Your intelligent campus assistant</p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6">
            <div className="p-4 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Sparkles className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h4 className="font-extrabold text-lg text-foreground">Hi! I&apos;m Friday 👋</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your intelligent campus assistant. Ask me about events, lost items, opportunities, skills, or anything else.
              </p>
            </div>

            {/* Starter Prompt Chips */}
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSendMessage(prompt)}
                  className="px-3 py-1.5 rounded-xl bg-accent/60 hover:bg-indigo-600/20 hover:text-indigo-400 border border-border/60 text-xs font-medium transition-colors text-muted-foreground"
                >
                  &ldquo;{prompt}&rdquo;
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="h-8 w-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-indigo-400" />
                </div>
              )}

              <div
                className={`max-w-2xl space-y-3 ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white font-medium rounded-tr-none shadow-md"
                      : "bg-accent/40 border border-border/60 text-foreground rounded-tl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>

                {/* Grounded References Cards */}
                {msg.references && msg.references.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-semibold text-muted-foreground block flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-400" /> Grounded References ({msg.references.length}):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.references.map((ref, idx) => (
                        <Link key={ref.id || idx} href={ref.link}>
                          <div className="p-2.5 rounded-xl bg-background/60 hover:bg-accent border border-border/60 transition-all flex items-center justify-between group">
                            <div className="min-w-0 pr-2 space-y-0.5">
                              <p className="text-xs font-semibold text-foreground truncate group-hover:text-indigo-400">
                                {ref.title}
                              </p>
                              <p className="text-[10px] text-muted-foreground truncate">{ref.subtitle}</p>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground shrink-0" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {msg.role === "user" && (
                <div className="h-8 w-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-slate-300" />
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start gap-3">
            <div className="h-8 w-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-none bg-accent/40 border border-border/60 flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
              <span>Friday is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
      <div className="p-4 border-t border-border/60 bg-background/50 backdrop-blur-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex gap-2"
        >
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask Friday about events, teams, or lost items..."
            disabled={isLoading}
            className="bg-background/80 border-border text-sm rounded-xl"
          />
          <Button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
