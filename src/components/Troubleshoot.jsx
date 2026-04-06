import React, { useState } from 'react';

const BROKEN_SCENARIOS = [
  { id: 1, description: 'PC won’t boot. PSU might be dead.', solution: 'Replace PSU' },
  { id: 2, description: 'No display. RAM may be loose.', solution: 'Reseat RAM' },
  { id: 3, description: 'OS not loading. Drive corrupted.', solution: 'Reinstall OS' }
];

export default function Troubleshoot() {
  const [current, setCurrent] = useState(BROKEN_SCENARIOS[0]);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState('');

  const checkSolution = () => {
    if (input.toLowerCase() === current.solution.toLowerCase()) {
      setFeedback('✅ Correct!');
    } else {
      setFeedback('❌ Try again.');
    }
  };

  const nextScenario = () => {
    const nextIndex = (current.id) % BROKEN_SCENARIOS.length;
    setCurrent(BROKEN_SCENARIOS[nextIndex]);
    setInput('');
    setFeedback('');
  };

  return (
    <div>
      <h2>Troubleshooting Simulator</h2>
      <div className="card">
        <p><strong>Problem:</strong> {current.description}</p>
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Your solution" />
        <button onClick={checkSolution}>Check</button>
        <button onClick={nextScenario}>Next</button>
        <p>{feedback}</p>
      </div>
    </div>
  );
}
