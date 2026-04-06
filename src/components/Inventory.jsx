import React from 'react';

export default function Inventory({ inventory, addToBuild }) {
  return (
    <div>
      <h2>Inventory</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {inventory.map((comp, i) => (
          <div key={i} className="card">
            <strong>{comp.type}</strong>: {comp.name}
            <br />
            <button onClick={() => addToBuild(comp)}>Add to Build</button>
          </div>
        ))}
      </div>
    </div>
  );
}
