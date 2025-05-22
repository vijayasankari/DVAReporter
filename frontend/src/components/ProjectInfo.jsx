import { useEffect } from 'react';

function ProjectInfo({ value = {}, onChange }) {
  const handleChange = (field, newValue) => {
    onChange({ ...value, [field]: newValue });
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h2 className="text-xl font-bold text-center">Project Info</h2>

      <div>
        <label className="block font-medium">Application Title</label>
        <input
          type="text"
          className="w-full border p-2"
          value={value.title || ''}
          onChange={e => handleChange('title', e.target.value)}
        />
      </div>

      <div>
        <label className="block font-medium">Requested By</label>
        <input
          type="text"
          className="w-full border p-2"
          value={value.requester || ''}
          onChange={e => handleChange('requester', e.target.value)}
        />
      </div>

      <div>
        <label className="block font-medium">Analyst Name</label>
        <input
          type="text"
          className="w-full border p-2"
          value={value.analyst || ''}
          onChange={e => handleChange('analyst', e.target.value)}
        />
      </div>

      <div>
        <label className="block font-medium">URLs</label>
        <textarea
          rows="2"
          className="w-full border p-2"
          value={value.urls || ''}
          onChange={e => handleChange('urls', e.target.value)}
          placeholder="Enter comma-separated or multiple URLs"
        />
      </div>

      <div>
        <label className="block font-medium">Scope</label>
        <textarea
          rows="2"
          className="w-full border p-2"
          value={value.scope || ''}
          onChange={e => handleChange('scope', e.target.value)}
        />
      </div>
    </div>
  );
}

export default ProjectInfo;
