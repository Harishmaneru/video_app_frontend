import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import VideoRecorder from './components/VideoRecorder';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/application" element={<VideoRecorder />} />
        <Route path="/*" element={<VideoRecorder />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;