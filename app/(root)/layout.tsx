import Navbar from '../../components/Navbar'
import MobileBottomNav from '../../components/MobileBottomNav'
import { ThemeProvider } from '../../components/ThemeProvider'
import NotificationPermissionPrompt from '../../components/NotificationPermissionPrompt'

export default function Layout({children}:Readonly<{children:React.ReactNode}>) { 
    return (
       <ThemeProvider>
         <main className='font-work-sans'>
          <Navbar />
          <NotificationPermissionPrompt />
          <div className="pt-16 pb-20 sm:pb-0">
            {children}
          </div>
          <MobileBottomNav />
         </main>
       </ThemeProvider>
    )
}
