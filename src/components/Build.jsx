// src/components/Build.jsx
import React from 'react';
import { images } from '../assets/images';

export default function Build({ build, removeFromBuild }) {
  return (
    <div>
      <h2>Current Build</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {build.map(comp => (
          <div key={comp.id} className="card">
            <img
              src={images[comp.type]}
              alt={comp.type}
              width={64}
              height={64}
              style={{ marginBottom: '8px' }}
            />
            <strong>{comp.type}</strong>: {comp.name}
            <br />
            <button onClick={() => removeFromBuild(comp.id)} style={{ marginTop: '8px' }}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
