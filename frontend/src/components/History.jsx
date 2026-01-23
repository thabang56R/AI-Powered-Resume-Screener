// client/src/components/History.jsx

import React from 'react';

function History({ history }) {
  return (
    <div className="history-section">
      <h2>Past Screenings</h2>
      {history.length === 0 ? (
        <p>No history yet. Start screening!</p>
      ) : (
        <ul>
          {history.map((item) => (
            <li key={item._id}>
              <span>{new Date(item.createdAt).toLocaleString()}</span> - Match: {item.matchPercentage}%
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default History;