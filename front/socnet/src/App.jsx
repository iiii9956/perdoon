import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';

import Feed from './pages/Feed/Feed';
import Auth from './pages/Auth/Auth';
import Profile from './pages/Profile/Profile';
import Comments from './pages/Comments/Comments';
import FriendsList from './pages/FriendsList/FriendsList';
import Search from './pages/Search/Search';
import Settings from './pages/Settings/Settings';
import Chats from './pages/Chats/Chats';
import Admin from './pages/Admin/Admin';

import './App.css';

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <Header />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/feed" replace />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/auth" element={<Auth />} />

            <Route path="/profile/me" element={<Profile isOwn={true} />} />
            <Route path="/profile/:id" element={<Profile isOwn={false} />} />
            <Route path="/post/:id/comments" element={<Comments />} />

            <Route path="/friends" element={<FriendsList />} />
            <Route path="/search" element={<Search />} />
            <Route path="/settings" element={<Settings />} />

            {/* Чаты: список и конкретный чат */}
            <Route path="/chats" element={<Chats />} />
            <Route path="/chats/:chatId" element={<Chats />} />

            {/* Панель администратора */}
            <Route path="/admin" element={<Admin />} />

            <Route path="*" element={<Navigate to="/feed" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
