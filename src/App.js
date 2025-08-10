import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './output.css';
import WelcomePage from './components/WelcomePage';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import Disclaimer from './components/Disclaimer';
import ChatInterface from './components/ChatInterface';
import AddMember from './components/AddMember';
import EditMember from './components/EditMember';
import DeleteMember from './components/DeleteMember';
import PrivateRoute from './components/PrivateRoute';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected Routes */}
        <Route path="/disclaimer" element={<PrivateRoute element={<Disclaimer />} />} />
        <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
        <Route path="/medlife/prompt" element={<PrivateRoute element={<ChatInterface />} />} />
        <Route path="/medlife/addmember" element={<PrivateRoute element={<AddMember />} />} />
        <Route path="/medlife/editmember" element={<PrivateRoute element={<EditMember />} />} />
        <Route path="/medlife/deletemember" element={<PrivateRoute element={<DeleteMember />} />} />
      </Routes>
    </Router>
  );
};

export default App;
