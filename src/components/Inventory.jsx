// src/components/Inventory.jsx
import React from 'react';
import { images } from '../assets/images';

export default function Inventory({ inventory, addToBuild }) {
  return (
    <div>
      <h2>Inventory</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {inventory.map((comp, i) => (
          <div key={i} className="card">
            <img
              src={images[comp.type]}
              alt={comp.type}
              width={64}
              height={64}
              style={{ marginBottom: '8px' }}
            />
            <strong>{comp.type}</strong>: {comp.name}
            <br />
            <button onClick={() => addToBuild(comp)} style={{ marginTop: '8px' }}>
              Add to Build
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
