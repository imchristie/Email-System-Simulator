import React from 'react';
import {BrowserRouter, Route, Routes, Navigate} from 'react-router-dom';

import Home from './components/Home';
import Login from './components/Login';

const AuthenticatedRoute = ({children}) => {
  if (localStorage.getItem('user')) {
    return children;
  }
  return <Navigate to="/login" replace />;
};

/**
 * @return {object} JSX
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <AuthenticatedRoute >
              <Home />
            </AuthenticatedRoute>
          }
        />
        <Route path="/login" exact element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
