import React, { useRef, useEffect, useState } from "react";

const messages = [
  { from: "you", text: "Gay", time: "5/21/2024, 11:02 AM" },
  { from: "them", text: "Bromance", time: "6/12/2024, 7:48 PM" },
  { from: "them", text: "Heyy", time: "Sep 5, 1:08 PM" },
  { from: "them", text: "Niggga", time: "Sep 5, 1:09 PM" },
];

const ChatView = () => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <section className="flex flex-col h-full flex-1 bg-white">
      <header className="p-4 border-b font-bold text-blue-600 sticky top-0 bg-white z-10">Koushik Hmd</header>
      <main className="flex-1 overflow-y-auto px-4 py-2 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className="flex items-end w-full my-2">
            {msg.from !== "you" ? (
              <>
                <button
                  type="button"
                  className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shadow transition hover:scale-110"
                  title="React"
                >
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 19V6M12 6l-5 5M12 6l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <div className="max-w-[60%] p-3 rounded-2xl text-sm shadow bg-gray-100 text-gray-900 ml-0">
                  {msg.text}
                </div>
                <div className="flex-1" />
              </>
            ) : (
              <>
                <div className="flex-1" />
                <div className="max-w-[60%] p-3 rounded-2xl text-sm shadow bg-blue-100 text-blue-900 mr-0">
                  {msg.text}
                </div>
                <button
                  type="button"
                  className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shadow transition hover:scale-110"
                  title="React"
                >
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 19V6M12 6l-5 5M12 6l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </main>
      <form className="p-2 border-t flex items-center gap-2 sticky bottom-0 bg-white">
        <button type="button" className="text-xl px-2">➕</button>
        <input
          type="text"
          className="flex-1 p-2 border rounded-full bg-gray-100 focus:outline-none"
          placeholder="Type a message..."
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button type="submit" className="text-xl px-2 text-blue-600">➤</button>
      </form>
    </section>
  );
};

export default ChatView; 