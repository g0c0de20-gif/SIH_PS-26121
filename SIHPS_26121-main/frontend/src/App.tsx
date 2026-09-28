import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { ActiveWellProvider } from './context/ActiveWellContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MapView from './pages/MapView';
import WellList from './pages/WellList';
import WellProfile from './pages/WellProfile';
import KnowledgeSearch from './pages/KnowledgeSearch';
import Correlation from './pages/Correlation';
import Alerts from './pages/Alerts';
import Ingest from './pages/Ingest';

export default function App() {
  return (
    <BrowserRouter>
      <ActiveWellProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="map" element={<MapView />} />
            <Route path="wells" element={<WellList />} />
            <Route path="wells/:id" element={<WellProfile />} />
            <Route path="search" element={<KnowledgeSearch />} />
            <Route path="correlation" element={<Correlation />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="ingest" element={<Ingest />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </ActiveWellProvider>
    </BrowserRouter>
  );
}
