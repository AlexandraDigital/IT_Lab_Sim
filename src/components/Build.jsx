import React from 'react';

export default function Build({ build, removeFromBuild }) {
  return (
    <div>
      <h2>Current Build</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {build.map(comp => (
          <div key={comp.id} className="card">
            <strong>{comp.type}</strong>: {comp.name}
            <br />
            <button onClick={() => removeFromBuild(comp.id)}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}
