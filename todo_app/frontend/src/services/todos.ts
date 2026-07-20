import ns from './networkService.ts'

import { type Todo } from '../types.ts'

const fetchTodos = () => {
  const todosObj = ns.fetchData('api/todos', ns.readJSON)
  const todos = todosObj !== null ? ('todos' in todosObj ? todosObj['todos'] as Array<Todo> : []) : []

  return todos
}

export default { fetchTodos }