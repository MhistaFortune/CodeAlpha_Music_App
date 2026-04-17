import React from 'react';
import { Sidebar } from './Sidebar';
import { BottomPlayer } from './BottomPlayer';
import type { ViewState } from '../../App';
import { Home, Compass, Library as LibraryIcon } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface MainLayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
}

export function MainLayout({ children, currentView, setCurrentView }: MainLayoutProps) {
  const { user, logout } = useAuthStore();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);

  return (
    <div className="flex h-screen bg-[#050a15] text-white overflow-hidden pb-32 md:pb-24 font-sans relative">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="flex-1 overflow-y-auto bg-gradient-to-b from-[#152542] to-[#0b162c] rounded-lg md:m-2 relative">
        <header className="sticky top-0 z-10 h-16 flex items-center px-4 md:px-6 bg-[#0b162c]/80 backdrop-blur-md">
          <div className="hidden md:flex gap-2">
            <div className="w-8 h-8 rounded-full bg-[#050a15] flex items-center justify-center cursor-not-allowed text-gray-400">
              {'<'}
            </div>
            <div className="w-8 h-8 rounded-full bg-[#050a15] flex items-center justify-center cursor-not-allowed text-gray-400">
              {'>'}
            </div>
          </div>
          <div className="ml-auto relative">
            <div 
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-3 cursor-pointer bg-[#050a15] hover:bg-[#1e3357] rounded-full pr-3 pl-1 py-1 transition-colors"
            >
              <div className={`w-7 h-7 rounded-full overflow-hidden border transition-colors ${isProfileMenuOpen ? 'border-[#3b82f6]' : 'border-transparent hover:border-[#3b82f6]'}`}>
                <img src={user?.avatarUrl} alt={user?.username} className="w-full h-full object-cover" />
              </div>
              <span className={`hidden md:block text-sm font-bold transition ${isProfileMenuOpen ? 'text-white' : 'text-gray-300 hover:text-white'}`}>
                {user?.username}
              </span>
            </div>
            {/* Popover */}
            {isProfileMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProfileMenuOpen(false)}
                />
                <div className="absolute right-0 top-12 whitespace-nowrap bg-[#1e3357] border border-[#2a4470] shadow-2xl rounded-md transition-opacity z-50 overflow-hidden flex flex-col min-w-[150px]">
                   <button onClick={() => { setCurrentView('profile'); setIsProfileMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-[#2a4470] hover:text-white font-bold transition border-b border-[#2a4470]">
                     Profile Settings
                   </button>
                   <button onClick={() => { logout(); setCurrentView('browse'); setIsProfileMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-[#2a4470] hover:text-red-300 font-bold transition">
                     Log out
                   </button>
                </div>
              </>
            )}
          </div>
        </header>

        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
      <BottomPlayer />

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#1e3357] border-t border-[#050a15] flex items-center justify-around z-50">
        <button onClick={() => setCurrentView('home')} className={`flex flex-col items-center justify-center w-full h-full ${currentView === 'home' ? 'text-white' : 'text-gray-400'}`}>
          <Home className="w-6 h-6" />
          <span className="text-[10px] mt-1">Home</span>
        </button>
        <button onClick={() => setCurrentView('browse')} className={`flex flex-col items-center justify-center w-full h-full ${currentView === 'browse' ? 'text-white' : 'text-gray-400'}`}>
          <Compass className="w-6 h-6" />
          <span className="text-[10px] mt-1">Browse</span>
        </button>
        <button onClick={() => setCurrentView('library')} className={`flex flex-col items-center justify-center w-full h-full ${currentView === 'library' ? 'text-white' : 'text-gray-400'}`}>
          <LibraryIcon className="w-6 h-6" />
          <span className="text-[10px] mt-1">Library</span>
        </button>
      </nav>
    </div>
  );
}
