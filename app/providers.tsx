"use client"
import React from 'react'
import { ContextProvider } from '@/context'
import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'react-hot-toast'
import Script from 'next/script'

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>
    <ContextProvider>
      <Toaster />
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="beforeInteractive" />
      {children}
    </ContextProvider>
  </SessionProvider>
}
