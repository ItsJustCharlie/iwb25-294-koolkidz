import React, { useState } from 'react';

function OptionsPanel({ currentSettings, onSave }) {
  const [includeSecondHand, setIncludeSecondHand] = useState(currentSettings.includeSecondHand);
  const [localOnly, setLocalOnly] = useState(currentSettings.localOnly);

  const handleSave = () => {
    onSave({
      includeSecondHand,
      localOnly
    });
  };

  return (
    <div style={{ marginTop: 15, border: '1px solid #ccc', padding: 10, borderRadius: 5 }}>
      <div>
        <label>
          <input
            type="checkbox"
            checked={includeSecondHand}
            onChange={() => setIncludeSecondHand(!includeSecondHand)}
          />
          Include second-hand products
        </label>
      </div>

      <div style={{ marginTop: 10 }}>
        <label>
          <input
            type="checkbox"
            checked={localOnly}
            onChange={() => setLocalOnly(!localOnly)}
          />
          Local only / Include overseas
        </label>
      </div>

      <button onClick={handleSave} style={{ marginTop: 10 }}>
        Set Settings
      </button>
    </div>
  );
}

export default OptionsPanel;
