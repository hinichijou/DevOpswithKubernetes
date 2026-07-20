import { createContext } from "react";

import { type Todo } from '../types.ts'

const TodoContext = createContext<Todo[]>([]);

export default TodoContext;
