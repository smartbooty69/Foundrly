import React, { useEffect, useState } from 'react';
import { StreamChat } from 'stream-chat';
import { useSession } from 'next-auth/react';
import { Message, Suggested } from './types';
import SuggestedUsers from './SuggestedUsers';
import NewMessageScreen from './NewMessageScreen';

// --- Icon Components (placeholders) ---
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const MoreHorizontalIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const UserPlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="m22 21-2-2"></path><path d="M16 16h6"></path></svg>;

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;

const Avatar: React.FC<{ initial?: string; src?: string; isInvite?: boolean }> = ({ initial, src, isInvite }) => {
    if (src) {
        const isPinterest = src.includes('E60023');
        return <img src={src} alt="avatar" className={`w-[50px] h-[50px] rounded-full mr-3 object-cover ${isPinterest ? 'bg-[#E60023]' : ''}`} />;
    }
    if (isInvite) {
        return <div className="w-[50px] h-[50px] rounded-full mr-3 flex items-center justify-center bg-gray-100 text-gray-600"><UserPlusIcon /></div>
    }
    return <div className="w-[50px] h-[50px] rounded-full mr-3 flex items-center justify-center bg-gray-200 text-gray-900 font-medium text-xl">{initial}</div>;
};

const MessageItem: React.FC<{ item: Message; onSelect: (id: string) => void; idx: number }> = ({ item, onSelect, idx }) => (
    <div
      className={`flex items-center px-4 py-2 cursor-pointer transition-colors rounded-lg ${idx === 2 ? 'bg-gray-100' : ''} hover:bg-gray-100`}
      onClick={() => onSelect(item.id)}
    >
        <Avatar src={item.avatarUrl} initial={item.avatarInitial} />
        <div className="flex flex-col flex-1 min-w-0">
            <span className="font-bold text-base text-gray-900 truncate">{item.name}</span>
            <span className="text-sm text-gray-600 truncate max-w-xs">{item.message}</span>
        </div>
        <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">{item.time}</span>
        {item.hasCloseButton && <button className="ml-2 p-0 bg-none border-none cursor-pointer flex items-center"><CloseIcon /></button>}
    </div>
);

interface MessagesScreenProps {
  onSelectChat: (id: string) => void;
  onClose?: () => void;
}

const MessagesScreen: React.FC<MessagesScreenProps> = ({ onSelectChat, onClose }) => {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [showNewMessage, setShowNewMessage] = useState(false);
    const userId = session?.user?.id;

    useEffect(() => {
        if (!userId) return;
        let chatClient: StreamChat;
        let disconnect: (() => void) | undefined;

        async function fetchChannels() {
            const res = await fetch("/api/chat/token", {
                method: "POST",
                body: JSON.stringify({ userId }),
                headers: { "Content-Type": "application/json" },
            });
            const { token } = await res.json();

            chatClient = StreamChat.getInstance(apiKey);
            await chatClient.connectUser({ id: userId }, token);

            const filters = { members: { $in: [userId] }, type: "messaging" };
            const sort = [{ last_message_at: -1 }];
            const userChannels = await chatClient.queryChannels(filters, sort, { watch: true, state: true, limit: 30 });

            setMessages(userChannels.map((ch) => {
                const other = Object.values(ch.state.members).find((m: any) => m.user.id !== userId)?.user;
                return {
                    id: ch.id,
                    name: other?.name || other?.id || "Unknown",
                    message: ch.state.messages.length > 0
                        ? ch.state.messages[ch.state.messages.length - 1].text
                        : "No messages yet.",
                    time: ch.state.messages.length > 0
                        ? new Date(ch.state.messages[ch.state.messages.length - 1].created_at).toLocaleDateString()
                        : "",
                    avatarUrl: other?.image,
                };
            }));

            disconnect = () => chatClient.disconnectUser();
        }

        fetchChannels();
        return () => { disconnect?.(); };
    }, [userId]);

    const handleSuggestedUserSelect = (user: any) => {
        // Handle suggested user selection - could start a new chat
        console.log('Selected suggested user:', user);
        // You can implement logic to start a new chat with this user
    };

    const handleNewMessageClick = () => {
        setShowNewMessage(true);
    };

    const handleNewMessageBack = () => {
        setShowNewMessage(false);
    };

    const handleContactSelect = (contact: any) => {
        console.log('Selected contact for new message:', contact);
        // Here you would implement the logic to start a new chat with the selected contact
        // For now, just go back to the messages screen
        setShowNewMessage(false);
    };

    const handleStartChat = (chatId: string, contact: any) => {
        console.log('Starting new chat:', chatId, contact);
        // Start the new chat by calling onSelectChat with the new chat ID
        onSelectChat(chatId);
        setShowNewMessage(false);
    };

    // Show NewMessageScreen if active
    if (showNewMessage) {
        return (
            <NewMessageScreen 
                onGoBack={handleNewMessageBack}
                onSelectContact={handleContactSelect}
                onStartChat={handleStartChat}
            />
        );
    }

    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
                <button className="bg-none border-none cursor-pointer p-1 flex items-center justify-center mr-2" onClick={onClose}><CloseIcon /></button>
                <h1 className="text-lg font-bold m-0">Messages</h1>
                <button className="bg-none border-none cursor-pointer p-1 flex items-center justify-center"><MoreHorizontalIcon /></button>
            </div>

            <div className="flex-1 py-2 overflow-y-auto">
                <div className="flex items-center px-4 py-2 gap-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={handleNewMessageClick}>
                    <button className="bg-[#e60023] border-none rounded-full w-14 h-14 flex items-center justify-center cursor-pointer"><EditIcon /></button>
                    <span className="text-lg font-bold">New message</span>
                </div>

                <div className="py-2">
                    <h2 className="text-base font-normal text-gray-600 px-4 mb-1">Messages</h2>
                    {messages.map((msg, idx) => <MessageItem key={msg.id} item={msg} onSelect={onSelectChat} idx={idx} />)}
                </div>

                <div className="py-2">
                    <h2 className="text-base font-normal text-gray-600 px-4 mb-1">Suggested</h2>
                    <SuggestedUsers onSelectUser={handleSuggestedUserSelect} onStartChat={handleStartChat} maxResults={5} />
                </div>
            </div>
        </div>
    );
};

export default MessagesScreen; 