import MainImage from '@/components/MainImage/MainImage'
import ServerInputRow from '@/components/InputRow/ServerInputRow'
import TodoList from '@/components/TodoList/TodoList'

const App = () => {
  return (
    <>
      <h1>Todo app</h1>
      <div>
        <MainImage/>
        <ServerInputRow/>
      </div>
      <h2>Todos</h2>
      <div>
        <TodoList/>
      </div>
    </>
  )
}

export default App
