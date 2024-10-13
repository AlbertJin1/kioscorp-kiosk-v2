// src/App.js
import React from 'react';
import MainComponent from './components/MainComponent'; // Import your MainComponent
import './index.css'; // Ensure you import your Tailwind CSS file

function App() {
  return (
    <div className="App">
      <MainComponent /> {/* Render the MainComponent */}
    </div>
  );
}

export default App;
