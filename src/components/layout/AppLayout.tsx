import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="main-content">
        <header className="main-header">
          <div className="main-header-left">
            <button
              className="mobile-menu-btn btn btn-ghost btn-icon"
              onClick={() => setSidebarOpen(true)}
              id="mobile-menu-toggle"
            >
              <Menu size={22} />
            </button>
          </div>
        </header>
        <div className="main-body">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
