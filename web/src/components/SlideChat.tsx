import { useState, useRef, useEffect } from "react";
import { useToast } from "./Toast";
import { Send, Loader } from "lucide-react";

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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

    // For first message, just generate the slide directly
    if (messages.length === 0) {
      try {
        if (onSlideReady) {
          onSlideReady(userMessage);
        }
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Perfect! I'm creating your slide now...",
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        toast.error("Failed to generate slide");
        console.error(error);
      } finally {
        setLoading(false);
      }
      return;
    }

    // For subsequent messages, use the conversational flow
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
    <div className="flex flex-col w-full">
      {/* Messages Container - Only show if there are messages */}
      {messages.length > 0 && (
        <div className="mb-6 space-y-4 max-h-96 overflow-y-auto px-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
            >
              <div
                className={`max-w-2xl px-5 py-3 rounded-2xl ${
                  msg.role === "user"
                    ? "bg-[var(--color-primary)] text-white rounded-br-sm shadow-md"
                    : "bg-white text-[var(--neutral-1)] rounded-bl-sm border border-[var(--neutral-7)] shadow-sm"
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-white text-[var(--neutral-1)] px-5 py-3 rounded-2xl rounded-bl-sm border border-[var(--neutral-7)] shadow-sm">
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
      )}

      {/* ChatGPT-Style Input Area */}
      <div className="w-full">
        <form onSubmit={handleSendMessage} className="relative">
          <div className="relative glass rounded-[var(--radius-2xl)] shadow-xl border border-[var(--neutral-7)] overflow-hidden transition-all hover:shadow-2xl focus-within:shadow-2xl focus-within:border-[var(--color-primary)]">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={messages.length === 0 ? "Describe the slide you want to create..." : "Continue the conversation..."}
              disabled={loading || isGenerating}
              className="w-full px-6 py-5 pr-16 text-base bg-transparent border-none outline-none disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-[var(--neutral-4)]"
              style={{ fontSize: '16px' }}
            />
            <button
              type="submit"
              disabled={loading || isGenerating || !input.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-[var(--color-primary)] text-white rounded-xl font-medium hover:bg-[var(--color-primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 shadow-lg disabled:hover:scale-100"
              aria-label="Send message"
            >
              {loading || isGenerating ? (
                <Loader size={20} className="animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
          {messages.length === 0 && (
            <p className="text-center text-sm text-[var(--neutral-4)] mt-3">
              Try: "How to cook a noodle extra al dente" or "The origin of the name Salvatore"
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

