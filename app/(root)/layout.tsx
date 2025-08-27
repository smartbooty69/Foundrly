import Navbar from '../../components/Navbar'
import { ThemeProvider } from '../../components/ThemeProvider'

export default function Layout({children}:Readonly<{children:React.ReactNode}>) { 
    return (
       <ThemeProvider>
         <main className='font-work-sans'>
          <Navbar />
          {children}
         </main>
       </ThemeProvider>
    )
}
