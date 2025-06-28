"use client"

import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background">
      <main className="flex flex-col items-center gap-12 max-w-2xl w-full">
        {/* Banner */}
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-bold text-foreground">
            The Law Shop
          </h1>
          <p className="text-xl text-muted-foreground">
            Your Legal Solutions Partner
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          <Button 
            size="lg" 
            className="h-16 text-lg"
            onClick={() => console.log('Fill out form')}
          >
            Fill Out Form
          </Button>
          
          <Button 
            size="lg" 
            variant="outline" 
            className="h-16 text-lg"
            onClick={() => console.log('Book a consult')}
          >
            Book a Consult
          </Button>
          
          <Button 
            size="lg" 
            variant="secondary" 
            className="h-16 text-lg"
            onClick={() => console.log('Make a payment')}
          >
            Make a Payment
          </Button>
          
          <Button 
            size="lg" 
            variant="outline" 
            className="h-16 text-lg"
            onClick={() => console.log('Register for portal')}
          >
            Register for Portal
          </Button>
          
          <Button 
            size="lg" 
            className="h-16 text-lg md:col-span-2 lg:col-span-1"
            onClick={() => console.log('Login for portal')}
          >
            Login for Portal
          </Button>
        </div>
      </main>
    </div>
  )
}