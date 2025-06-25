"use client";

import { useSession, signIn, signOut } from 'next-auth/react'
import { BadgePlus, LogOut } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'


const Navbar = () => {
    const session = useSession();

  return (
    <header className="px-5 py-3 bg-white chadow-sm font-work-sans" >
        <nav className="flex justify-between items-center">
            <Link href="/">
                <Image src="/logo.png" alt="logo" width={144} height={30} />
            </Link> 
            <div className="flex items-center gap-5 text-black">
                { session.data && session.data.user ? (
                    <>
                        <Link href="/startup/create">
                            <span className="max-sm:hidden">Create</span>
                            <BadgePlus className='size-6 sm:hidden' />
                        </Link>

                        <button onClick={() => signOut()}>
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
                        <button onClick={() => signIn('github')}>
                            Login
                        </button>
                )}
            </div>
        </nav>
    </header>
  )
}
  
export default Navbar