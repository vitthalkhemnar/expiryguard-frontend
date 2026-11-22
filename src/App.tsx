import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { PosTerminal } from './pages/PosTerminal';
import { OrdersView } from './pages/OrdersView';
import { BatchesView } from './pages/BatchesView';
import { Dashboard } from './pages/Dashboard';
import { DisposalsView } from './pages/DisposalsView';
import { StaffView } from './pages/StaffView';

const MainLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('pos');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading ExpiryGuard...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />
      <main className="flex-1">
        {currentTab === 'pos' && <PosTerminal />}
        {currentTab === 'orders' && <OrdersView />}
        {currentTab === 'batches' && <BatchesView />}
        {currentTab === 'dashboard' && <Dashboard />}
        {currentTab === 'disposals' && <DisposalsView />}
        {currentTab === 'staff' && <StaffView />}
      </main>
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        &copy; 2026 ExpiryGuard - Vitthal Khemnar. All rights reserved.
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
