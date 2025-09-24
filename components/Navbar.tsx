"use client";

import { useSession, signIn, signOut } from 'next-auth/react'
import { BadgePlus, LogOut, MessageSquare, Trophy, Award, Brain } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import ChatController from './ChatController'
import NotificationBell from './NotificationBell'
import { useNotifications } from '@/hooks/useNotifications'
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications'

const Navbar = () => {
    const session = useSession();
    const [isMessagesOpen, setIsMessagesOpen] = useState(false);
    const { totalUnreadMessages, isStreamChatLoaded } = useNotifications();
    
    // Initialize real-time notifications globally
    useRealtimeNotifications();
    
    // Messages loaded

  return (
    <header className="fixed top-0 left-0 right-0 px-5 py-3 bg-white shadow-sm font-work-sans z-50" >
        <nav className="flex justify-between items-center">
            <Link href="/">
                <Image src="/logo.png" alt="logo" width={144} height={30} />
            </Link> 
            <div className="flex items-center gap-5 text-black">
                { session.data && session.data.user ? (
                    <>
                        <Link href="/startup/create" className="p-2 rounded-lg hover:bg-gray-100 hover:text-blue-600 transition-colors flex items-center gap-2">
                            <BadgePlus className='size-5' />
                            <span className="max-sm:hidden">Create</span>
                        </Link>

                        <div className="relative">
                            <button 
                                onClick={() => setIsMessagesOpen(true)}
                                className="relative flex items-center gap-2 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
                            >
                                <MessageSquare className='size-5' />
                                <span className="max-sm:hidden">Messages</span>
                                {session.data?.user && isStreamChatLoaded && totalUnreadMessages && totalUnreadMessages > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                                        {totalUnreadMessages > 99 ? '99+' : totalUnreadMessages}
                                    </span>
                                )}
                            </button>
                        </div>

                        <Link href={`/badges?user=${session.data.user.id}`} className="p-2 rounded-lg hover:bg-gray-100 hover:text-blue-600 transition-colors flex items-center gap-2">
                            <Trophy className='size-5' />
                            <span className="max-sm:hidden">Badges</span>
                        </Link>
                                
                        <Link href="/leaderboard" className="p-2 rounded-lg hover:bg-gray-100 hover:text-blue-600 transition-colors flex items-center gap-2">
                            <Award className='size-5' />
                            <span className="max-sm:hidden">Leaderboard</span>
                        </Link>


                        <NotificationBell />

                        <Link href={`/user/${session.data.user.id}`}>
                            <Avatar className='size-10' >
                                <AvatarImage src={session.data.user.image || ''} alt={session.data.user.name || ''}/>
                                <AvatarFallback>{session.data.user.name?.slice(0, 1) || 'U'}</AvatarFallback>
                            </Avatar>
                        </Link>
                    </> 
                ) : (
                        <button onClick={() => signIn('github')} className="p-2 rounded-lg hover:bg-gray-100 hover:text-blue-600 transition-colors">
                            Login
                        </button>
                )}
            </div>
        </nav>
        {session.data?.user && (
            <ChatController
                isOpen={isMessagesOpen}
                onClose={() => setIsMessagesOpen(false)}
                currentUserId={session.data.user.id}
            />
        )}
    </header>
  )
}
  
export default Navbar