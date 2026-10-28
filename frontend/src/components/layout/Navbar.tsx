import { Link } from 'react-router-dom'
import GlobalSearch from '../search/GlobalSearch'

export default function Navbar() {
  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center px-4 gap-4 z-40 shrink-0">
      <Link to="/" className="flex items-center gap-2 shrink-0">
        <div className="w-7 h-7 bg-orange-500 rounded-md flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
            <path d="M4 15.5C4 16.3 4.7 17 5.5 17h1l.5 1.5h6l.5-1.5h1c.8 0 1.5-.7 1.5-1.5v-8C16 6.1 14.7 5 13 5H7C5.3 5 4 6.1 4 7.5v8zm2-1v-6h8v6H6zm2-4.5h4v1H8v-1zM6 18.5l-.5 1.5h13l-.5-1.5H6z"/>
          </svg>
        </div>
        <span className="text-white font-bold text-lg tracking-tight">Railyn</span>
      </Link>

      <div className="flex-1 flex justify-center">
        <GlobalSearch />
      </div>

      <nav className="hidden md:flex items-center gap-1 shrink-0">
        <NavLink to="/trains">Trains</NavLink>
        <NavLink to="/stations">Stations</NavLink>
        <NavLink to="/zones">Zones</NavLink>
        <NavLink to="/services">Services</NavLink>
      </nav>
    </header>
  )
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
    >
      {children}
    </Link>
  )
}
