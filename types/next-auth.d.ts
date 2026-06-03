import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: 'admin' | 'seller'
    } & DefaultSession['user']
  }

  interface User {
    role: 'admin' | 'seller'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: 'admin' | 'seller'
  }
}
