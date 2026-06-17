import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';

// Will create these pages next
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';

// Placeholders for other pages
const Placeholder = ({ title }) => <div className="flex items-center justify-center h-full"><h1 className="text-2xl font-outfit text-slate-500">{title}</h1></div>;

const App = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="phases" element={<Placeholder title="Campaign Phases" />} />
            <Route path="analytics" element={<Placeholder title="KPI Analytics" />} />
            <Route path="team" element={<Placeholder title="Team Management" />} />
            <Route path="calendar" element={<Placeholder title="Calendar" />} />
            <Route path="settings" element={<Placeholder title="Settings" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;