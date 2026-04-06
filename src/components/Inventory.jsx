import React from 'react';

export default function Inventory({ inventory, addToBuild }) {

  const handleDragStart = (e, component) => {
    e.dataTransfer.setData('component', JSON.stringify(component));
  };

  return (
    <div className="inventory">
      <h2>Inventory</h2>
      <div className="component-list">
        {inventory.map((comp, index) => (
          <div
            key={index}
            className="component card"
            draggable
            onDragStart={(e) => handleDragStart(e, comp)}
          >
            {comp.name} ({comp.type})
          </div>
        ))}
      </div>
    </div>
  );
}
