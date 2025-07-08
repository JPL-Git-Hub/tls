import { Button } from '@/catalyst/components/button'
import { Heading } from '@/catalyst/components/heading'
import { Text } from '@/catalyst/components/text'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
      <main className="flex flex-col items-center gap-12 max-w-2xl w-full">
        {/* Professional Header */}
        <div className="text-center space-y-4 bg-white px-8 py-12 rounded-lg shadow-sm ring-1 ring-gray-950/5">
          <Heading level={1} className="text-6xl font-bold text-indigo-600">
            The Law Shop
          </Heading>
          <Text className="text-xl text-gray-600">
            Your Legal Solutions Partner
          </Text>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          <Button 
            href="/lead" 
            color="indigo" 
            className="h-16 text-lg w-full"
          >
            Fill Out Form
          </Button>

          <Button 
            href="/consult" 
            color="white" 
            className="h-16 text-lg w-full"
          >
            Book a Consult
          </Button>

          <Button 
            href="/payment" 
            color="zinc" 
            className="h-16 text-lg w-full"
          >
            Make a Payment
          </Button>

          <Button 
            href="/portal/register" 
            color="white" 
            className="h-16 text-lg w-full"
          >
            Register for Portal
          </Button>

          <Button 
            href="/portal/login" 
            color="indigo" 
            className="h-16 text-lg md:col-span-2 lg:col-span-1 w-full"
          >
            Client Login
          </Button>

          <Button 
            href="/login" 
            outline 
            className="h-16 text-lg w-full"
          >
            Attorney Login
          </Button>
        </div>
      </main>
    </div>
  )
}