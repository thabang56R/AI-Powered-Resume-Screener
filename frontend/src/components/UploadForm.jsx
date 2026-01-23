// client/src/components/UploadForm.jsx

import React, { useState } from 'react';
import axios from 'axios';
import {Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

function UploadForm({ setScreeningResult, setLoading, setError, loading, fetchHistory }) {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');

  const handleFileChange = (e) => setResumeFile(e.target.files[0]);
  const handleJobDescChange = (e) => setJobDescription(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeFile || !jobDescription.trim()) {
      setError('Please upload a resume and provide a job description.');
      return;
    }

    setLoading(true);
    setError(null);
    setScreeningResult(null);

    const formData = new FormData();
    formData.append('resume', resumeFile);
    formData.append('jobDescription', jobDescription);

    try {
      const response = await axios.post('http://localhost:5000/api/screen-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setScreeningResult(response.data);
      fetchHistory(); // Refresh history
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="upload-form">
      <div className="form-group">
        <label htmlFor="resume">Upload Resume <span data-tip="PDF or DOCX only" data-for="resume-tip">(?)</span></label>
        <Tooltip id="resume-tip" />
        <input type="file" id="resume" accept=".pdf,.docx" onChange={handleFileChange} className="file-input" />
      </div>

      <div className="form-group">
        <label htmlFor="jobDesc">Job Description</label>
        <textarea
          id="jobDesc"
          value={jobDescription}
          onChange={handleJobDescChange}
          placeholder="Paste the job details here..."
          className="textarea-input"
        />
      </div>

      <button type="submit" className="submit-button" disabled={loading}>
        {loading ? 'Processing...' : 'Launch AI Scan'}
      </button>
    </form>
  );
}

export default UploadForm;