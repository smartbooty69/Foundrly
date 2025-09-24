import Navbar from '../../components/Navbar'
import { ThemeProvider } from '../../components/ThemeProvider'
import NotificationPermissionPrompt from '../../components/NotificationPermissionPrompt'

export default function Layout({children}:Readonly<{children:React.ReactNode}>) { 
    return (
       <ThemeProvider>
         <main className='font-work-sans'>
          <Navbar />
          <NotificationPermissionPrompt />
          <div className="pt-16">
            {children}
          </div>
         </main>
       </ThemeProvider>
    )
}
