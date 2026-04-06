import React from 'react';

export default function CompatibilityCheck({ build }) {
  const checkCompatibility = () => {
    const cpu = build.find(c => c.type === 'CPU');
    const motherboard = build.find(c => c.type === 'Motherboard');
    if (!cpu || !motherboard) return 'Add CPU and Motherboard to check.';
    if (cpu.compatibleMotherboard === motherboard.socket) return '✅ Compatible!';
    return '❌ Incompatible!';
  };

  return (
    <div>
      <h2>Compatibility Check</h2>
      <div className="card">{checkCompatibility()}</div>
    </div>
  );
}
