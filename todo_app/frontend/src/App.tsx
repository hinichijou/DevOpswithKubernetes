import './App.css'
import is from './services/image'
import ts from './services/todos'
import TodoContext from './contexts/TodoContext.ts'
import MainImage from './components/MainImage/MainImage'
import InputRow from './components/InputRow/InputRow'
import TodoList from './components/TodoList/TodoList'

const App = () => {
  //Tarpeellinen? Jos file system jaettu niin kaiken järjen mukaan renderöi kun valmis
  const imageLink = is.checkImage()
  const todos = ts.fetchTodos()

  console.log(imageLink)
  console.log(todos)

  return (
    <>
      <h1>Todo app</h1>
      <div>
        <MainImage/>
        <InputRow/>
      </div>
      <h2>Todos</h2>
      <div>
        <TodoContext value={todos}>
          <TodoList/>
        </TodoContext>
      </div>
    </>
  )
}

export default App
