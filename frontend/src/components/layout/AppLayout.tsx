import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import CommandBar from './CommandBar'

export default function AppLayout() {
  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <CommandBar />
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
