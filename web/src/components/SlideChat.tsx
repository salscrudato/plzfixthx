import { useState, useRef, useEffect } from "react";
import { useToast } from "./Toast";
import { MessageCircle, Send, Loader } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface ChatProps {
  onSlideReady?: (prompt: string) => void;
  isGenerating?: boolean;
}

export function SlideChat({ onSlideReady, isGenerating = false }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm here to help you create an amazing slide. Let's start with the basics. What's the main topic or title for your slide?",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateFollowUp = async (userMessage: string, conversationHistory: Message[]) => {
    try {
      const response = await fetch(
        "https://generateslidespec-3wgb3rbjta-uc.a.run.app",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `You are a helpful assistant gathering information to create a professional PowerPoint slide.

User message: "${userMessage}"

Previous conversation:
${conversationHistory.map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n")}

TASK: Based on the conversation, determine what information we still need and ask ONE specific follow-up question.

INFORMATION NEEDED (in order):
1. Title/Topic - What is the slide about?
2. Main Content - What are the key points or bullet points?
3. Additional Details - Any specific data, metrics, or context?
4. Design Preference - Any style preferences (professional, creative, minimal, etc.)?

RESPONSE FORMAT:
- If we have title, content, and enough context: Respond with "READY_TO_CREATE: [comprehensive slide prompt]"
- Otherwise: Ask ONE specific, natural follow-up question to gather missing information

EXAMPLES OF GOOD QUESTIONS:
- "What are the 3-5 main points you want to highlight?"
- "Do you have any specific numbers or metrics to include?"
- "What's the audience for this slide?"
- "Would you prefer a professional or creative design style?"
- "Any specific color scheme or branding guidelines?"

Keep responses concise, friendly, and natural. Never say "I need more information" - always ask a specific question.`,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to generate response");
      const data = await response.json();

      let assistantMessage = data.slideSpec?.content?.title || "What are the key points or main content you'd like on this slide?";

      // Check if we have enough info
      if (assistantMessage.includes("READY_TO_CREATE:")) {
        const slidePrompt = assistantMessage.replace("READY_TO_CREATE:", "").trim();
        return { message: "Perfect! I have all the information I need. Creating your slide now...", isReady: true, slidePrompt };
      }

      return { message: assistantMessage, isReady: false };
    } catch (error) {
      console.error("Error generating response:", error);
      return { message: "What are the key points or main content you'd like on this slide?", isReady: false };
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || isGenerating) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    // Add user message
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, newUserMessage]);

    try {
      const { message, isReady, slidePrompt } = await generateFollowUp(userMessage, [...messages, newUserMessage]);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: message,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      if (isReady && slidePrompt && onSlideReady) {
        setTimeout(() => {
          onSlideReady(slidePrompt);
        }, 500);
      }
    } catch (error) {
      toast.error("Failed to process message");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[var(--radius-2xl)] shadow-lg border border-[var(--neutral-7)] overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] px-6 py-4 text-white">
        <div className="flex items-center gap-2">
          <MessageCircle size={20} />
          <h2 className="text-lg font-semibold">Slide Builder Chat</h2>
        </div>
        <p className="text-sm opacity-90 mt-1">Let's create your slide together</p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                msg.role === "user"
                  ? "bg-[var(--color-primary)] text-white rounded-br-none"
                  : "bg-[var(--neutral-8)] text-[var(--neutral-1)] rounded-bl-none border border-[var(--neutral-7)]"
              }`}
            >
              <p className="text-sm leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[var(--neutral-8)] text-[var(--neutral-1)] px-4 py-3 rounded-lg rounded-bl-none border border-[var(--neutral-7)]">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-[var(--neutral-4)] rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-[var(--neutral-4)] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                <div className="w-2 h-2 bg-[var(--neutral-4)] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-[var(--neutral-7)] p-4 bg-[var(--neutral-9)]">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your response..."
            disabled={loading || isGenerating}
            className="flex-1 px-4 py-2 rounded-lg border border-[var(--neutral-7)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={loading || isGenerating || !input.trim()}
            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:bg-[var(--color-primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading ? (
              <Loader size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

