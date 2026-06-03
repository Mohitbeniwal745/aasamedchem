'use client'

import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import { FlaskConical, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast('Invalid email or password', 'error')
      } else {
        toast('Login successful!', 'success')
        router.push('/')
        router.refresh()
      }
    } catch {
      toast('Something went wrong', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center bg-slate-50 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto px-4 animate-in">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-md mb-3">
            <FlaskConical className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">AasaMedChem</h1>
          <p className="text-slate-600 text-sm mt-1.5 font-medium">Inventory Management System</p>
        </div>

        <Card className="bg-white border border-slate-200 shadow-xl rounded-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold text-center text-slate-900">Sign In</CardTitle>
            <CardDescription className="text-center text-slate-600 font-medium">
              Enter your credentials to access the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-800 font-semibold">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@test.com"
                  className="bg-white border-slate-300 text-slate-900 focus:border-indigo-600 focus:ring-indigo-600 placeholder:text-slate-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-800 font-semibold">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="bg-white border-slate-300 text-slate-900 focus:border-indigo-600 focus:ring-indigo-600 placeholder:text-slate-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md mt-2 py-2 rounded-lg cursor-pointer" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Test credentials hint */}
            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-inner">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Test Credentials
              </p>
              <div className="space-y-1.5 text-xs text-slate-600">
                <p>
                  <span className="font-semibold text-slate-800">Admin:</span> admin@test.com / Admin123!
                </p>
                <p>
                  <span className="font-semibold text-slate-800">Seller:</span> seller@test.com / Seller123!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
