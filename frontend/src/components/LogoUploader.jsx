// src/components/LogoUploader.jsx
import { useState } from 'react';
import axios from 'axios';

function LogoUploader() {
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState('');

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('http://127.0.0.1:8000/logo/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setStatus('Logo uploaded successfully');
    } catch (err) {
      console.error(err);
      setStatus('Failed to upload logo');
    }
  };

  return (
    <div className="max-w-md mx-auto border p-6 rounded shadow text-center">
      <h2 className="text-xl font-bold mb-4">Upload Report Logo</h2>
      <input type="file" accept="image/*" onChange={handleUpload} className="mb-4" />

      {preview && (
        <div>
          <p className="mb-2 font-semibold">Preview:</p>
          <img src={preview} alt="Logo Preview" className="mx-auto max-h-40" />
        </div>
      )}

      {status && <p className="mt-4 text-sm text-gray-600">{status}</p>}
    </div>
  );
}

export default LogoUploader;