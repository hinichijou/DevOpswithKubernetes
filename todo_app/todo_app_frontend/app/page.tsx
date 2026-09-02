import MainImage from '@/components/MainImage/MainImage'
import ServerInputRow from '@/components/InputRow/ServerInputRow'
import TodoList from '@/components/TodoList/TodoList'
import BreakAppButton from '@/components/BreakAppButton/BreakAppButton'
import AppBrokenBanner from '@/src/components/AppBrokenBanner/AppBrokenBanner'
import { getAppBroken } from '@/services/test'

async function App () {
  const healthy = !await getAppBroken()

  if (healthy) {
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
        <div>
          <BreakAppButton/>
        </div>
      </>
    )
  }
  else {
    return (
      <>
        <AppBrokenBanner/>
      </>
    )
  }
}

export default App
