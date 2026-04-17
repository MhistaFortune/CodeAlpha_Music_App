import { useState } from 'react';
import { Home } from '@/pages/Home';
import { Library } from '@/pages/Library';
import { Browse } from '@/pages/Browse';
import { PlaylistDetail } from '@/pages/PlaylistDetail';
import { MainLayout } from '@/components/layout/MainLayout';
import { Auth } from '@/pages/Auth';
import { Profile } from '@/pages/Profile';
import { useAuthStore } from '@/store/useAuthStore';

export type ViewState = string;

function App() {
  const [currentView, _setCurrentView] = useState<ViewState>('browse');
  const [previousView, setPreviousView] = useState<ViewState>('browse');
  const { user } = useAuthStore();

  const setCurrentView = (view: ViewState) => {
    if (view !== currentView) {
      setPreviousView(currentView);
      _setCurrentView(view);
    }
  };

  const goBack = () => {
    _setCurrentView(previousView);
  };

  if (!user) {
    return <Auth />;
  }

  return (
    <MainLayout currentView={currentView} setCurrentView={setCurrentView}>
      {currentView === 'home' && <Home />}
      {currentView === 'browse' && <Browse />}
      {currentView === 'library' && <Library />}
      {currentView === 'profile' && <Profile onSave={goBack} />}
      {currentView.startsWith('playlist_') && <PlaylistDetail playlistId={currentView.replace('playlist_', '')} />}
    </MainLayout>
  );
}

export default App;
