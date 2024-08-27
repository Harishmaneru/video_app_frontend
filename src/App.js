import React from 'react';

import { BrowserRouter, Routes, Route , Navigate} from 'react-router-dom';
import VideoRecorder from './components/VideoRecorder';

const App = () => {
  

  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/application" element={<VideoRecorder />} />
        <Route path="*" element={<Navigate to="/application" />} />
        <Route path="/" element={<Navigate to="/application" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;