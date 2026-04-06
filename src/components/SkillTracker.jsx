import React, { useState, useEffect } from 'react';

export default function SkillTracker({ build }) {
  const [skills, setSkills] = useState({ hardware: 0, troubleshooting: 0 });

  useEffect(() => {
    const hardwareCount = build.length;
    setSkills(prev => ({ ...prev, hardware: hardwareCount }));
  }, [build]);

  return (
    <div>
      <h2>Skill Tracker</h2>
      <div className="card">
        <p>Hardware Skill: {skills.hardware} points</p>
        <p>Troubleshooting Skill: {skills.troubleshooting} points</p>
      </div>
    </div>
  );
}
