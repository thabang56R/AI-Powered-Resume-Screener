// client/src/components/ScreeningResults.jsx

import React from 'react';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import jsPDF from 'jspdf';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

function ScreeningResults({ result }) {
  if (!result) return null;

  // Radar Chart Data
  const skillsData = {
    labels: Object.keys(result.skillsMatch),
    datasets: [{
      label: 'Skill Match %',
      data: Object.values(result.skillsMatch),
      backgroundColor: 'rgba(0, 255, 255, 0.2)',
      borderColor: '#00ffff',
      borderWidth: 2,
    }],
  };

  const options = {
    scales: { r: { angleLines: { color: '#ff00ff' }, grid: { color: '#ff00ff' }, max: 100 } },
    plugins: { legend: { labels: { color: '#ffffff' } } },
  };

  // Export to PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('AI Resume Screening Report', 10, 10);
    doc.setFontSize(12);
    doc.text(`Match: ${result.matchPercentage}%`, 10, 20);
    doc.text('Strengths: ' + result.strengths.join(', '), 10, 30);
    doc.text('Weaknesses: ' + result.weaknesses.join(', '), 10, 40);
    doc.text('Feedback: ' + result.feedback, 10, 50, { maxWidth: 180 });
    doc.save('screening-report.pdf');
  };

  return (
    <div className="results-section">
      <h2>AI Insights</h2>
      <div className="result-card">
        <div className="match-progress">
          <div className="progress-bar" style={{ width: `${result.matchPercentage}%` }}>
            {result.matchPercentage}%
          </div>
        </div>
        <p><strong>Strengths:</strong> {result.strengths.join(', ')}</p>
        <p><strong>Weaknesses:</strong> {result.weaknesses.join(', ')}</p>
        <div dangerouslySetInnerHTML={{ __html: `<strong>Feedback:</strong> ${result.feedback}` }} />
        
        {Object.keys(result.skillsMatch).length > 0 && (
          <div className="chart-container">
            <Radar data={skillsData} options={options} />
          </div>
        )}

        <button onClick={exportPDF} className="export-button">Export Report</button>
      </div>
    </div>
  );
}

export default ScreeningResults;