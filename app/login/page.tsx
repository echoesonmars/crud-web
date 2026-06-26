import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-background p-6 md:p-10">
      <div className="w-full max-w-md md:max-w-4xl">
        <LoginForm />
      </div>
    </div>
  )
}
