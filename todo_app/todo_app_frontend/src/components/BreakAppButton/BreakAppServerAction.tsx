'use server'

import { toggleBreakApp } from '@/services/test'

// toggleBreakApp as a server action. This can be passed into a client component
// Basically a simple way to write an server endpoint for client components (works with server components as well, for example static buttons)
// It's not possible to have a server action and a client component in the same file, needs to be broken to separate files.
export async function toggleBreak() {
  await toggleBreakApp()
}