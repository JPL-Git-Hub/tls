import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background">
      <main className="flex flex-col items-center gap-12 max-w-2xl w-full">
        {/* Banner */}
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-bold text-foreground">The Law Shop</h1>
          <p className="text-xl text-muted-foreground">
            Your Legal Solutions Partner
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          <Link href="/lead">
            <Button size="lg" className="h-16 text-lg w-full">
              Fill Out Form
            </Button>
          </Link>

          <Link href="/consult">
            <Button size="lg" variant="outline" className="h-16 text-lg w-full">
              Book a Consult
            </Button>
          </Link>

          <Link href="/payment">
            <Button
              size="lg"
              variant="secondary"
              className="h-16 text-lg w-full"
            >
              Make a Payment
            </Button>
          </Link>

          <Link href="/portal/register">
            <Button size="lg" variant="outline" className="h-16 text-lg w-full">
              Register for Portal
            </Button>
          </Link>

          <Link href="/portal/login">
            <Button
              size="lg"
              className="h-16 text-lg md:col-span-2 lg:col-span-1 w-full"
            >
              Login for Portal
            </Button>
          </Link>

          <Link href="/login">
            <Button size="lg" variant="ghost" className="h-16 text-lg w-full">
              Attorney Login
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
