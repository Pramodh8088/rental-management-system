import React from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom'

import Home from './pages/Home'
import Login from './pages/Login'
import LandlordRegister from './pages/LandlordRegister'
import LandlordDashboard from './pages/LandlordDashboard'
import TenantDashboard from './pages/TenantDashboard'
import ProtectedRoute from './components/ProtectedRoute'

const App = () => {

  return (
    <BrowserRouter>

      <Routes>

        {/* First Page */}
        <Route
          path="/"
          element={<Home />}
        />

        {/* Landlord Registration */}
        <Route
          path="/landlord/register"
          element={<LandlordRegister />}
        />

        {/* Landlord Login */}
        <Route
          path="/landlord/login"
          element={
            <Login role="LANDLORD" />
          }
        />

        {/* Tenant Login */}
        <Route
          path="/tenant/login"
          element={
            <Login role="TENANT" />
          }
        />

        {/* Old login URL redirects to home */}
        <Route
          path="/login"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

        {/* Landlord Dashboard */}
        <Route
          path="/landlord"
          element={
            <ProtectedRoute role="LANDLORD">
              <LandlordDashboard />
            </ProtectedRoute>
          }
        />

        {/* Tenant Dashboard */}
        <Route
          path="/tenant"
          element={
            <ProtectedRoute role="TENANT">
              <TenantDashboard />
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  )
}

export default App