import * as z from 'zod'

const TODO_MIN_LENGTH  = process.env.TODO_MIN_LENGTH || 0
const TODO_MAX_LENGTH  = process.env.TODO_MAX_LENGTH || 0

export const todoSchema = z.object({
  id: z.optional(z.string()),
  title: z.string()
    .min(TODO_MIN_LENGTH, `Todo is too short. Minimum length is ${TODO_MIN_LENGTH} character.`)
    .max(TODO_MAX_LENGTH, `Todo is too long. Maximum length is ${TODO_MAX_LENGTH} characters`)
})

//Can infer type from schema if necessary
export type Todo = z.input<typeof todoSchema>