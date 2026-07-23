import ns from '@/services/networkService'
import { localApiUrl, publicApiUrl } from '@/src/constants'
import { type Todo } from '@/src/types'
import { readJSONResponse, createPostOptions } from '@/src/utils/client_safe_utils'

export const fetchTodos = async  () => {
  const todosObj = await ns.makeRequest(`${localApiUrl}todos`, readJSONResponse)
  const todos = todosObj !== null ? ('todos' in todosObj ? JSON.parse(todosObj['todos'] as string) as Array<Todo> : []) : []
  return todos
}

export const createTodo = async (newTodo: object) : Promise<string | null> => {
  //Its possible to use the frontend backend as a proxy for the backend requests
  //const resp = await fetch('api/backend-proxy/todos', createPostOptions(newTodo))
  //const todoIdObj = await resp.json()
  const todoIdObj = await ns.makeRequest(`${publicApiUrl}todos`, readJSONResponse, createPostOptions(newTodo))
  const todo = todoIdObj !== null ? todoIdObj as string : null

  return todo
}