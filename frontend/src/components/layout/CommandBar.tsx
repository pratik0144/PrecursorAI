import { Menu, Search, Bell, User } from 'lucide-react'
import { useAppStore } from '../../stores/app-store'

export default function CommandBar() {
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)

  return (
    <header className="h-16 border-b border-border bg-card px-4 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="p-2 hover:bg-secondary rounded-md text-muted-foreground">
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Global</span>
          <span>/</span>
          <span className="text-foreground">All Assets</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {__USE_MOCKS__ && (
          <span className="px-2 py-1 text-xs font-bold bg-amber-500/20 text-amber-500 rounded-md">
            MOCK MODE
          </span>
        )}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search command..." 
            className="h-9 w-64 rounded-md border border-border bg-background pl-9 pr-4 text-sm outline-none focus:border-accent"
          />
        </div>
        <button className="p-2 text-muted-foreground hover:bg-secondary rounded-md">
          <Bell className="h-5 w-5" />
        </button>
        <button className="p-2 bg-secondary text-foreground rounded-full h-8 w-8 flex items-center justify-center">
          <User className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
