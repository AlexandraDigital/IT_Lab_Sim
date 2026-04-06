import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import Inventory from './components/Inventory';
import Build from './components/Build';
import CompatibilityCheck from './components/CompatibilityCheck';
import Troubleshoot from './components/Troubleshoot';
import SkillTracker from './components/SkillTracker';
import OSInstall from './components/OSInstall';
import NetworkingLab from './components/NetworkingLab';

import './index.css';

const COMPONENTS = [
  { type: 'CPU', name: 'Intel i5', compatibleMotherboard: 'LGA1200' },
  { type: 'CPU', name: 'AMD Ryzen 5', compatibleMotherboard: 'AM4' },
  { type: 'Motherboard', name: 'ASUS LGA1200', socket: 'LGA1200' },
  { type: 'Motherboard', name: 'MSI AM4', socket: 'AM4' },
  { type: 'RAM', name: '16GB DDR4' },
  { type: 'RAM', name: '32GB DDR4' },
  { type: 'GPU', name: 'NVIDIA RTX 3060' },
  { type: 'GPU', name: 'AMD RX 6600' },
  { type: 'Storage', name: '512GB SSD' },
  { type: 'Storage', name: '1TB HDD' }
];

const TABS = [
  { id: 'inventory', label: 'Inventory' },
  { id: 'build', label: 'Build' },
  { id: 'compatibility', label: 'Compatibility' },
  { id: 'troubleshoot', label: 'Troubleshoot' },
  { id: 'skills', label: 'Skill Tracker' },
  { id: 'os', label: 'OS Install' },
  { id: 'network', label: 'Networking Lab' },
];

export default function App() {
  const [inventory] = useState(COMPONENTS);
  const [build, setBuild] = useState([]);
  const [activeTab, setActiveTab] = useState('inventory');

  const addToBuild = (component) => {
    setBuild([...build, { ...component, id: uuidv4() }]);
  };

  const removeFromBuild = (id) => {
    setBuild(build.filter((c) => c.id !== id));
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'inventory':
        return <Inventory inventory={inventory} addToBuild={addToBuild} />;
      case 'build':
        return <Build build={build} removeFromBuild={removeFromBuild} />;
      case 'compatibility':
        return <CompatibilityCheck build={build} />;
      case 'troubleshoot':
        return <Troubleshoot />;
      case 'skills':
        return <SkillTracker build={build} />;
      case 'os':
        return <OSInstall build={build} />;
      case 'network':
        return <NetworkingLab />;
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <h1 style={{ textAlign: 'center' }}>IT Lab Simulator</h1>
      <div className="main-layout">
        {/* Sidebar */}
        <nav className="sidebar">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={activeTab === tab.id ? 'tab active' : 'tab'}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Main Content */}
        <div className="main-content card">
          {renderTab()}
        </div>
      </div>
    </div>
  );
}
