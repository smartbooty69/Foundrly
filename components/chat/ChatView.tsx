import React, { useEffect, useRef, useState } from "react";
import { StreamChat } from "stream-chat";
import { useSession } from "next-auth/react";

const BackArrowIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
);
const MoreOptionsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" /></svg>
);
const AddIcon = () => (
  <svg height="24" width="24" viewBox="0 0 24 24" fill="white"><path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z" /></svg>
);
const SendIcon = () => (
  <svg height="24" width="24" viewBox="0 0 24 24" fill="white"><path d="M3 20V4L22 12L3 20ZM5 17L16.85 12L5 7V10.5L11 12L5 13.5V17Z" /></svg>
);
const ReplyIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 10 4 15 9 20" /><path d="M20 4v7a4 4 0 0 1-4 4H4" /></svg>
);
const AddReactionIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const EMOJI_REACTIONS = ['❤️', '😂', '😍', '😮', '👍', '👎'];

// Map emojis to valid Stream Chat reaction types
const EMOJI_TO_REACTION_TYPE: { [emoji: string]: string } = {
  '❤️': 'heart',
  '😂': 'laugh',
  '😍': 'love',
  '😮': 'wow',
  '👍': 'thumbsup',
  '👎': 'thumbsdown'
};

const REACTION_TYPE_TO_EMOJI: { [type: string]: string } = {
  'heart': '❤️',
  'laugh': '😂',
  'love': '😍',
  'wow': '😮',
  'thumbsup': '👍',
  'thumbsdown': '👎'
};

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;

interface ChatViewProps {
  chatId: string | null;
  onGoBack: () => void;
  currentUserId: string;
}

const ChatView: React.FC<ChatViewProps> = ({ chatId, onGoBack, currentUserId }) => {
  const { data: session } = useSession();
  const userId = currentUserId;
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [channel, setChannel] = useState<any>(null);
  const [activeReactionMessageId, setActiveReactionMessageId] = useState<string | null>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId || !chatId) return;
    let chatClient: StreamChat;
    let channelInstance: any;
    let unsub: any;

    async function init() {
      const res = await fetch("/api/chat/token", {
        method: "POST",
        body: JSON.stringify({ userId }),
        headers: { "Content-Type": "application/json" },
      });
      const { token } = await res.json();
      chatClient = StreamChat.getInstance(apiKey);
      await chatClient.connectUser({ id: userId }, token);

      channelInstance = chatClient.channel("messaging", chatId);
      await channelInstance.watch();
      setChannel(channelInstance);
      setMessages(channelInstance.state.messages);

      unsub = channelInstance.on("message.new", () => {
        // Just update the state with the current messages from the channel
        setMessages([...channelInstance.state.messages]);
      });
      channelInstance.on("message.updated", () => {
        setMessages([...channelInstance.state.messages]);
      });
      channelInstance.on("reaction.new", () => {
        setMessages([...channelInstance.state.messages]);
      });
      channelInstance.on("reaction.deleted", () => {
        setMessages([...channelInstance.state.messages]);
      });
    }
    init();
    return () => {
      unsub?.unsubscribe?.();
      channelInstance?.stopWatching?.();
      chatClient?.disconnectUser?.();
    };
  }, [userId, chatId]);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !channel) return;
    await channel.sendMessage({ text: input });
    setInput("");
  };

  const handleReaction = async (msg: any, emoji: string) => {
    if (!channel) return;
    const reactionType = EMOJI_TO_REACTION_TYPE[emoji];
    if (!reactionType) return;
    
    const userReaction = (msg.own_reactions || []).find((r: any) => r.user_id === userId && r.type === reactionType);
    if (userReaction) {
      await channel.deleteReaction(msg.id, reactionType);
    } else {
      await channel.sendReaction(msg.id, { type: reactionType });
    }
  };

  const otherUser = channel?.state?.members
    ? Object.values(channel.state.members).find((m: any) => m.user.id !== userId)?.user
    : null;

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 flex-shrink-0">
        <button className="p-1 rounded-full hover:bg-gray-100" onClick={onGoBack}><BackArrowIcon /></button>
        {otherUser?.image ? (
          <img src={otherUser.image} alt={otherUser.name} className="w-10 h-10 rounded-full object-cover mx-2" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-base font-bold text-gray-600 mx-2">{otherUser?.name?.[0] || "?"}</div>
        )}
        <span className="font-semibold flex-1">{otherUser?.name || "Chat"}</span>
        <button className="p-1 rounded-full hover:bg-gray-100"><MoreOptionsIcon /></button>
      </div>

      {/* Chat Body */}
      <main ref={chatBodyRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1 bg-white">
        {messages.map((msg: any, idx: number) => {
          const isOutgoing = msg?.user?.id === userId;
          const reactions = msg.latest_reactions || [];
          const reactionCounts: { [emoji: string]: number } = {};
          reactions.forEach((r: any) => {
            reactionCounts[r.type] = (reactionCounts[r.type] || 0) + 1;
          });
          const showProfilePic = !isOutgoing && (
            idx === messages.length - 1 ||
            messages[idx + 1]?.user?.id !== msg.user.id
          );
          return (
            <div key={msg.id ? `${msg.id}-${idx}` : idx} className="flex w-full items-end mb-3 px-2">
              {/* Incoming: [profile][bubble][actions][spacer] */}
              {!isOutgoing && (
                <>
                  {showProfilePic ? (
                    <img src={otherUser?.image} alt={otherUser?.name} className="w-10 h-10 rounded-full mr-2" />
                  ) : (
                    <div className="w-10 mr-2" />
                  )}
                  <div className="group flex flex-col items-start relative">
                    <div className="flex items-center relative">
                      <div 
                        className="max-w-[280px] px-4 py-2 bg-gray-100 rounded-2xl text-base shadow break-words cursor-pointer relative"
                        onClick={() => setActiveReactionMessageId(null)}
                      >
                        {msg.text}
                        {/* Reactions on bubble */}
                        {(() => {
                          const reactions = msg.latest_reactions || [];
                          const reactionCounts: { [emoji: string]: number } = {};
                          reactions.forEach((r: any) => {
                            const emoji = REACTION_TYPE_TO_EMOJI[r.type];
                            if (emoji) {
                              reactionCounts[emoji] = (reactionCounts[emoji] || 0) + 1;
                            }
                          });
                          
                          // Get the most common reaction or the first one
                          const reactionEntries = Object.entries(reactionCounts);
                          if (reactionEntries.length > 0) {
                            // Sort by count (descending) and take the first one
                            const [mostCommonEmoji, count] = reactionEntries.sort((a, b) => b[1] - a[1])[0];
                            return (
                              <div className="absolute -bottom-2 -right-1">
                                <span className="text-xs select-none px-1 py-0.5 bg-white rounded-full flex items-center shadow-sm border">
                                  {mostCommonEmoji}
                                </span>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                      <div className="flex flex-row items-center justify-center ml-2 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1" onClick={() => setActiveReactionMessageId(activeReactionMessageId === msg.id ? null : msg.id)}><AddReactionIcon /></button>
                      </div>
                    </div>
                    {/* Emoji picker positioned relative to chat bubble */}
                    {activeReactionMessageId === msg.id && (
                      <>
                        <div className="absolute inset-0 bg-black bg-opacity-20 z-40" onClick={() => setActiveReactionMessageId(null)} />
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex gap-2 bg-white rounded-2xl shadow-lg px-3 py-2 z-50 items-center" onClick={(e) => e.stopPropagation()}>
                          {EMOJI_REACTIONS.map((emoji) => (
                            <button
                              key={emoji}
                              className="text-2xl hover:scale-125 transition-transform"
                              onClick={() => {
                                handleReaction(msg, emoji);
                                setActiveReactionMessageId(null);
                              }}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex-1" />
                </>
              )}
              {/* Outgoing: [spacer][actions][bubble] */}
              {isOutgoing && (
                <>
                  <div className="flex-1" />
                  <div className="group flex flex-col items-end relative">
                    <div className="flex items-center relative">
                      <div className="flex flex-row items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1" onClick={() => setActiveReactionMessageId(activeReactionMessageId === msg.id ? null : msg.id)}><AddReactionIcon /></button>
                      </div>
                      <div 
                        className="max-w-[280px] px-4 py-2 bg-blue-100 rounded-2xl text-base shadow break-words cursor-pointer relative"
                        onClick={() => setActiveReactionMessageId(null)}
                      >
                        {msg.text}
                        {/* Reactions on bubble */}
                        {(() => {
                          const reactions = msg.latest_reactions || [];
                          const reactionCounts: { [emoji: string]: number } = {};
                          reactions.forEach((r: any) => {
                            const emoji = REACTION_TYPE_TO_EMOJI[r.type];
                            if (emoji) {
                              reactionCounts[emoji] = (reactionCounts[emoji] || 0) + 1;
                            }
                          });
                          
                          // Get the most common reaction or the first one
                          const reactionEntries = Object.entries(reactionCounts);
                          if (reactionEntries.length > 0) {
                            // Sort by count (descending) and take the first one
                            const [mostCommonEmoji, count] = reactionEntries.sort((a, b) => b[1] - a[1])[0];
                            return (
                              <div className="absolute -bottom-2 -right-1">
                                <span className="text-xs select-none px-1 py-0.5 bg-white rounded-full flex items-center shadow-sm border">
                                  {mostCommonEmoji}
                                </span>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                    {/* Emoji picker positioned relative to chat bubble */}
                    {activeReactionMessageId === msg.id && (
                      <>
                        <div className="absolute inset-0 bg-black bg-opacity-20 z-40" onClick={() => setActiveReactionMessageId(null)} />
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex gap-2 bg-white rounded-2xl shadow-lg px-3 py-2 z-50 items-center" onClick={(e) => e.stopPropagation()}>
                          {EMOJI_REACTIONS.map((emoji) => (
                            <button
                              key={emoji}
                              className="text-2xl hover:scale-125 transition-transform"
                              onClick={() => {
                                handleReaction(msg, emoji);
                                setActiveReactionMessageId(null);
                              }}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </main>

      {/* Footer */}
      <form onSubmit={handleSend} className="flex items-center px-4 py-3 gap-2 border-t border-gray-200 bg-white flex-shrink-0">

        <input
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-base border-none outline-none"
          placeholder="Type a message..."
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button type="submit" className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center" disabled={!input.trim()}><SendIcon /></button>
      </form>
    </div>
  );
};

export default ChatView; 