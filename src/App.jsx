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

export default function App() {
  const [inventory] = useState(COMPONENTS);
  const [build, setBuild] = useState([]);

  const addToBuild = (component) => setBuild([...build, { ...component, id: uuidv4() }]);
  const removeFromBuild = (id) => setBuild(build.filter(c => c.id !== id));

  return (
    <div>
      <h1>IT Lab Simulator</h1>
      <Inventory inventory={inventory} addToBuild={addToBuild} />
      <Build build={build} removeFromBuild={removeFromBuild} />
      <CompatibilityCheck build={build} />
      <Troubleshoot />
      <SkillTracker build={build} />
      <OSInstall build={build} />
      <NetworkingLab />
    </div>
  );
}
