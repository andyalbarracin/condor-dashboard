import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-background">
      <div className="w-full max-w-sm text-center">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Almost there!</h1>
            <p className="text-muted-foreground mt-2">Check your email to confirm your account.</p>
          </div>
          <Link href="/auth/login">
            <Button className="w-full">Back to Login</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
