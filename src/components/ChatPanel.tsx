import { useEffect, useRef, useState, type FormEvent } from "react";
import { Send, X } from "lucide-react";
import type { ChatMessage } from "../demo/use-meeting-sim";

export function ChatPanel({ messages, onSend, onClose }: { messages: ChatMessage[]; onSend: (text: string) => void; onClose: () => void }) {
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft("");
  };

  return (
    <aside className="side-panel" aria-label="Chat">
      <header className="side-header">
        <h2>Chat</h2>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close chat">
          <X size={18} />
        </button>
      </header>
      <ol className="chat-list" ref={listRef} aria-live="polite">
        {messages.length === 0 && <li className="empty">No messages yet</li>}
        {messages.map((message) => (
          <li key={message.id} className={message.mine ? "chat-msg mine" : "chat-msg"}>
            <div className="chat-meta">
              <strong>{message.mine ? "You" : message.name}</strong>
              <time>{message.time}</time>
            </div>
            <p>{message.text}</p>
          </li>
        ))}
      </ol>
      <form className="chat-form" onSubmit={submit}>
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Message everyone" aria-label="Message everyone" maxLength={300} />
        <button type="submit" className="icon-btn send" aria-label="Send message" disabled={!draft.trim()}>
          <Send size={18} />
        </button>
      </form>
    </aside>
  );
}
