import { Button } from '@/catalyst/components/button'
import { Heading } from '@/catalyst/components/heading'

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col p-2">
      <div className="flex grow flex-col items-center justify-center p-6 lg:rounded-lg lg:bg-white lg:p-10 lg:shadow-xs lg:ring-1 lg:ring-zinc-950/5 dark:lg:bg-zinc-900 dark:lg:ring-white/10">
        
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Heading level={1} className="text-4xl font-bold tracking-tight text-indigo-600 sm:text-6xl">
            The Law Shop
          </Heading>
        </div>

        {/* Action Buttons Grid */}
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Button 
              href="/lead" 
              color="indigo" 
              className="w-full h-16 text-lg justify-center"
            >
              Fill Out Form
            </Button>
            
            <Button 
              href="/consult" 
              color="indigo" 
              className="w-full h-16 text-lg justify-center"
            >
              Book a Consult
            </Button>
            
            <Button 
              href="/payment" 
              color="indigo" 
              className="w-full h-16 text-lg justify-center"
            >
              Make a Payment
            </Button>
            
            <Button 
              href="/portal/register" 
              color="indigo" 
              className="w-full h-16 text-lg justify-center"
            >
              Register for Portal
            </Button>
            
            <Button 
              href="/portal/login" 
              color="indigo" 
              className="w-full h-16 text-lg justify-center"
            >
              Client Login
            </Button>
            
            <Button 
              href="/login" 
              color="indigo" 
              className="w-full h-16 text-lg justify-center"
            >
              Attorney Login
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}