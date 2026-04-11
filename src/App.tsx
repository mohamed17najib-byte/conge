import { AppProvider } from './contexts/AppContext';
import Header from './Components/Header/Header';
import MainLayout from './Components/MainLayout/MainLayout';
import './App.css';

export default function App() {
  return (
    <AppProvider>
      <div className="app">
        <Header />
        <MainLayout />
      </div>
    </AppProvider>
  );
}