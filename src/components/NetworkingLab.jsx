import React, { useState } from 'react';

export default function NetworkingLab() {
  const [networkConfig, setNetworkConfig] = useState({
    PC1: { ip: '', subnet: '', gateway: '' },
    PC2: { ip: '', subnet: '', gateway: '' },
  });
  const [feedback, setFeedback] = useState('');

  const handleChange = (device, field, value) => {
    setNetworkConfig(prev => ({
      ...prev,
      [device]: { ...prev[device], [field]: value }
    }));
  };

  const checkNetwork = () => {
    const pc1 = networkConfig.PC1;
    const pc2 = networkConfig.PC2;

    if (pc1.ip === pc2.ip) {
      setFeedback('❌ IP addresses cannot be the same!');
      return;
    }
    if (!pc1.ip || !pc2.ip) {
      setFeedback('❌ Both PCs must have IP addresses!');
      return;
    }
    setFeedback('✅ Network configured correctly!');
  };

  return (
    <div>
      <h2>Networking Lab</h2>
      <div className="card">
        {['PC1', 'PC2'].map(pc => (
          <div key={pc} style={{ marginBottom: '10px' }}>
            <strong>{pc}</strong>
            <br />
            IP: <input value={networkConfig[pc].ip} onChange={e => handleChange(pc, 'ip', e.target.value)} placeholder="e.g. 192.168.1.2" />
            <br />
            Subnet: <input value={networkConfig[pc].subnet} onChange={e => handleChange(pc, 'subnet', e.target.value)} placeholder="e.g. 255.255.255.0" />
            <br />
            Gateway: <input value={networkConfig[pc].gateway} onChange={e => handleChange(pc, 'gateway', e.target.value)} placeholder="e.g. 192.168.1.1" />
          </div>
        ))}
        <button onClick={checkNetwork}>Check Network</button>
        {feedback && <p>{feedback}</p>}
      </div>
    </div>
  );
}
