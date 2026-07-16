import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { SearchProvider } from './context/SearchContext';
import { MonthProvider } from './context/MonthContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';
import MemberLayout from './components/MemberLayout';

import Login from './pages/Login';
import Register from './pages/Register';
import ProjectSelect from './pages/ProjectSelect';

import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Team from './pages/Team';
import Analytics from './pages/Analytics';
import Calendar from './pages/Calendar';
import MonthlyReviews from './pages/MonthlyReviews';
import Settings from './pages/Settings';

import MemberDashboardHome from './pages/member/MemberDashboardHome';
import MyTasks from './pages/member/MyTasks';
import TeamTasks from './pages/member/TeamTasks';
import MemberCalendarPage from './pages/member/MemberCalendarPage';
import MemberMonthlyReviews from './pages/member/MemberMonthlyReviews';
import MemberSettingsPage from './pages/member/MemberSettingsPage';

const Placeholder = ({ title }) => <div className="flex items-center justify-center h-full"><h1 className="text-2xl font-outfit text-slate-500">{title}</h1></div>;

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <SearchProvider>
          <MonthProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/projects" element={<ProtectedRoute><ProjectSelect /></ProtectedRoute>} />

                {/* Admin area */}
                <Route path="/project/:projectId" element={<AdminRoute><Layout /></AdminRoute>}>
                  <Route index element={<Dashboard />} />
                  <Route path="tasks" element={<Tasks />} />
                  <Route path="phases" element={<Placeholder title="Campaign Phases" />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="team" element={<Team />} />
                  <Route path="calendar" element={<Calendar />} />
                  <Route path="monthly-reviews" element={<MonthlyReviews />} />
                  <Route path="settings" element={<Settings />} />
                </Route>

                {/* Member area */}
                <Route path="/project/:projectId/member" element={<ProtectedRoute><MemberLayout /></ProtectedRoute>}>
                  <Route index element={<MemberDashboardHome />} />
                  <Route path="my-tasks" element={<MyTasks />} />
                  <Route path="team-tasks" element={<TeamTasks />} />
                  <Route path="calendar" element={<MemberCalendarPage />} />
                  <Route path="monthly-reviews" element={<MemberMonthlyReviews />} />
                  <Route path="settings" element={<MemberSettingsPage />} />
                </Route>

                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </BrowserRouter>
          </MonthProvider>
        </SearchProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;