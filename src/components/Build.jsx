import React from 'react';

export default function Build({ build, removeFromBuild }) {

  const handleDrop = (e) => {
    e.preventDefault();
    const comp = JSON.parse(e.dataTransfer.getData('component'));
    // Check if already in build
    if (!build.find(c => c.name === comp.name && c.type === comp.type)) {
      removeFromBuild(null); // placeholder for add function in App
      // In App, you should call addToBuild(comp)
      // We'll handle this via a prop callback
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  return (
    <div className="build"
         onDrop={(e) => e.preventDefault()} // Drag-drop handled in App for real add
         onDragOver={handleDragOver}
    >
      <h2>Build</h2>
      {build.length === 0 && <p>Drag components here to start your build</p>}
      <div className="component-list">
        {build.map((comp) => (
          <div key={comp.id} className="component card">
            {comp.name} ({comp.type})
            <button className="remove-btn" onClick={() => removeFromBuild(comp.id)}>x</button>
          </div>
        ))}
      </div>
    </div>
  );
}
