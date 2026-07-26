import ns from '@/services/networkService'
import { localApiUrl } from '@/src/constants'
import { type Todo } from '@/src/types'
import { readJSONResponse, createPostOptions } from '@/src/utils/client_safe_utils'

export const fetchTodos = async  () => {
  console.log(`Making get todos request to url ${localApiUrl()}todos`)
  const todosObj = await ns.makeRequest(`${localApiUrl()}todos`, readJSONResponse)
  const todos = todosObj !== null ? ('todos' in todosObj ? JSON.parse(todosObj['todos'] as string) as Array<Todo> : []) : []
  return todos
}

// The post is made from client so the url needs to be passed from the server components as it isn't available build time
export const createTodo = async (apiUrl: string, newTodo: object) : Promise<string | null> => {
  //Its possible to use the frontend backend as a proxy for the backend requests
  //const resp = await fetch('api/backend-proxy/todos', createPostOptions(newTodo))
  //const todoIdObj = await resp.json()
  console.log(`Making post todo request to url ${apiUrl}todos`)
  const todoIdObj = await ns.makeRequest(`${apiUrl}todos`, readJSONResponse, createPostOptions(newTodo))
  const todo = todoIdObj !== null ? todoIdObj as string : null

  return todo
}