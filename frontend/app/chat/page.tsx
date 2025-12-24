"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Send, Bot, Gamepad2, Search, } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

type Message = {
  id: string
  role: "user" | "ai"
  content: string
}

const SYSTEM_MESSAGE: Message = {
  id: "system",
  role: "ai",
  content:
    "Hey gamer 👋🎮\n\nI’m **GameFinder AI**, your personal game discovery companion.\n\nYou can ask me:\n• Game recommendations based on your vibe\n• Comparisons between games\n• Whether a game is worth playing\n• Or any gaming-related question\n\nTell me what you’re in the mood for, and let’s find your next obsession 🔥",
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([SYSTEM_MESSAGE])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

  /* Auto scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput("")
    setLoading(true)

    /* Only send last 10 messages (excluding system intro) */
    const history = updatedMessages
      .filter((m) => m.id !== "system")
      .slice(-10)
      .map((m) => ({
        role: m.role === "ai" ? "assistant" : "user",
        content: m.content,
      }))

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          history,
        }),
      })

      if (!res.ok) {
        throw new Error("Chat request failed")
      }

      const data = await res.json()

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        role: "ai",
        content:
          data.answer ||
          "Hmm… I couldn’t generate a response for that.",
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: "error",
          role: "ai",
          content:
            "⚠️ Neural link failed. Please check the backend connection.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden text-white">
      {/* BACKGROUND */}
      <div className="fixed inset-0 -z-10 bg-[#050505]" />
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-purple-900/25 via-black to-blue-900/25" />
      <div className="fixed top-[-30%] left-[-20%] w-[60%] h-[60%] bg-purple-600/25 blur-[180px]" />
      <div className="fixed bottom-[-30%] right-[-20%] w-[60%] h-[60%] bg-blue-600/25 blur-[180px]" />

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-black/75 backdrop-blur-md transition-all duration-300">
  <div className="container mx-auto px-6 py-4 flex items-center justify-between">
    
    {/* LOGO */}
    <Link href="/" className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 shadow-[0_0_18px_rgba(147,51,234,0.4)] flex items-center justify-center">
        <Gamepad2 className="w-5 h-5 text-white" />
      </div>
      <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
        GAMEFINDER
      </span>
    </Link>

    {/* ACTIONS */}
    <div className="flex items-center gap-3">
      <Button
        variant="ghost"
        className="text-neutral-400 hover:text-white hover:bg-white/5 transition-colors gap-2"
        asChild
      >
        <Link href="/">
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">Search</span>
        </Link>
      </Button>

      <Button
        variant="ghost"
        className="text-neutral-400 hover:text-white hover:bg-white/5 transition-colors group gap-2"
      >
        <Bot className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
        <span className="font-medium">AI Chat</span>
      </Button>
    </div>

  </div>
</nav>


      {/* CHAT */}
      <main className="max-w-4xl mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col h-[75vh]"
        >
          {/* HEADER */}
          <div className="p-6 border-b border-white/10">
            <h2 className="text-lg font-bold">GameFinder AI</h2>
            <p className="text-xs text-neutral-400">
              Your personalized Steam game expert
            </p>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-white text-black rounded-br-md"
                      : "bg-white/5 border border-white/10 text-neutral-200 rounded-bl-md"
                  }`}
                >
                  {m.content}
                </div>
              </motion.div>
            ))}

            {loading && (
              <div className="text-sm text-neutral-400 italic">
                GameFinder AI is thinking…
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* INPUT */}
          <div className="p-4 border-t border-white/10">
            <div className="flex gap-3 items-center bg-black/40 rounded-2xl border border-white/10 px-4 py-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Describe your gaming vibe…"
                className="flex-1 bg-transparent text-white placeholder:text-neutral-500 focus:outline-none"
              />
              <Button
                onClick={sendMessage}
                size="icon"
                disabled={loading}
                className="rounded-xl bg-white text-black hover:bg-neutral-200 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
