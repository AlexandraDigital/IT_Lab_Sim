import React, { useState } from 'react';

export default function OSInstall({ build }) {
  const [step, setStep] = useState(0);
  const [selectedOS, setSelectedOS] = useState('');
  const [feedback, setFeedback] = useState('');

  const steps = [
    'Check hardware requirements',
    'Select OS',
    'Partition storage',
    'Install OS files',
    'Install drivers',
    'Finish installation'
  ];

  const nextStep = () => {
    if (step === 0) {
      const hasCPU = build.find(c => c.type === 'CPU');
      const hasRAM = build.find(c => c.type === 'RAM');
      const hasStorage = build.find(c => c.type === 'Storage');
      if (!hasCPU || !hasRAM || !hasStorage) {
        setFeedback('❌ Missing required hardware!');
        return;
      }
    }
    if (step === 1 && !selectedOS) {
      setFeedback('❌ Please select an OS!');
      return;
    }
    setFeedback('');
    setStep(step + 1);
  };

  const resetInstall = () => {
    setStep(0);
    setSelectedOS('');
    setFeedback('');
  };

  return (
    <div>
      <h2>OS Installation Simulator</h2>
      <div className="card">
        <p><strong>Step {step + 1}:</strong> {steps[step]}</p>
        {step === 1 && (
          <select value={selectedOS} onChange={e => setSelectedOS(e.target.value)}>
            <option value="">--Select OS--</option>
            <option value="Windows 11">Windows 11</option>
            <option value="Ubuntu 24.04">Ubuntu 24.04</option>
          </select>
        )}
        {step < steps.length - 1 && <button onClick={nextStep}>Next Step</button>}
        {step === steps.length - 1 && <button onClick={resetInstall}>Restart Installation</button>}
        {feedback && <p>{feedback}</p>}
        {step === steps.length - 1 && !feedback && <p>✅ OS Installation Complete!</p>}
      </div>
    </div>
  );
}
