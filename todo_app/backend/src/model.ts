import * as z from 'zod'

export const todoSchema = z.object({
  id: z.optional(z.string()),
  title: z.string()
})

//Can infer type from schema if necessary
export type Todo = z.input<typeof todoSchema>