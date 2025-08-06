import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import "./output.css"
import WelcomePage from './components/WelcomePage';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import Disclaimer from './components/Disclaimer';
import ChatInterface from './components/ChatInterface';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage/>}/>
        <Route path="/signin" element={<SignIn/>}/>
        <Route path="/signup" element={<SignUp/>}/>
        <Route path="/disclaimer" element={<Disclaimer/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/chat" element={<ChatInterface/>}/>
      </Routes>
    </Router>
  )
}

export default App
