import React from 'react';
import { images } from '../assets/images';

export default function Inventory({ inventory, addToBuild }) {
  return (
    <div>
      <h2>Inventory</h2>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          justifyContent: 'center'
        }}
      >
        {inventory.map((comp, i) => (
          <div
            key={i}
            className="card"
            style={{
              width: 220,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}
          >
            <img
              src={images[comp.type] || "https://via.placeholder.com/64"}
              alt={comp.type}
              width={64}
              height={64}
              style={{ marginBottom: '8px' }}
            />

            <p>
              <strong>{comp.type}:</strong> {comp.name}
            </p>

            <button onClick={() => addToBuild(comp)}>
              Add to Build
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
