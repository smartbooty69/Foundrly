"use client";

import { useSession, signIn, signOut } from 'next-auth/react'
import { BadgePlus, LogOut, MessageSquare } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import ChatController from './ChatController'
import NotificationBell from './NotificationBell'
import { useNotifications } from '@/hooks/useNotifications'

const Navbar = () => {
    const session = useSession();
    const [isMessagesOpen, setIsMessagesOpen] = useState(false);
    const { totalUnreadMessages, isStreamChatLoaded } = useNotifications();
    
    // Debug logging
    console.log('Navbar totalUnreadMessages:', totalUnreadMessages > 0 ? totalUnreadMessages : 'none', 'isStreamChatLoaded:', isStreamChatLoaded);

  return (
    <header className="px-5 py-3 bg-white chadow-sm font-work-sans" >
        <nav className="flex justify-between items-center">
            <Link href="/">
                <Image src="/logo.png" alt="logo" width={144} height={30} />
            </Link> 
            <div className="flex items-center gap-5 text-black">
                { session.data && session.data.user ? (
                    <>
                        <Link href="/startup/create" className="p-2 rounded-lg hover:bg-gray-100 hover:text-blue-600 transition-colors">
                            <span className="max-sm:hidden">Create</span>
                            <BadgePlus className='size-6 sm:hidden' />
                        </Link>

                        <div className="relative">
                            <button 
                                onClick={() => setIsMessagesOpen(true)}
                                className="relative flex items-center gap-2 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
                            >
                                <span className="max-sm:hidden">Messages</span>
                                <MessageSquare className='size-6 sm:hidden' />
                                {session.data?.user && isStreamChatLoaded && totalUnreadMessages && totalUnreadMessages > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                                        {totalUnreadMessages > 99 ? '99+' : totalUnreadMessages}
                                    </span>
                                )}
                            </button>
                        </div>

                        <NotificationBell />

                        <button onClick={() => signOut()} className="p-2 rounded-lg hover:bg-gray-100 hover:text-blue-600 transition-colors">
                            <span className="max-sm:hidden">Logout</span>
                            <LogOut className='size-6 mt-1.5 sm:hidden text-red-500' />
                        </button>

                        <Link href={`/user/${session.data.user.id}`}>
                            <Avatar className='size-10' >
                                <AvatarImage src={session.data.user.image || ''} alt={session.data.user.name || ''}/>
                                <AvatarFallback>{session.data.user.name?.slice(0, 1)}</AvatarFallback>
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