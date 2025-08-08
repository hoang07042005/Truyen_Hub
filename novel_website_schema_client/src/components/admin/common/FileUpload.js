import React, { useState } from 'react';
import './FileUpload.css';

const FileUpload = ({
  id,
  label,
  onFileChange,
  onFileRemove,
  placeholder = "Chọn file ảnh",
  fileInfo = "Hỗ trợ: JPG, PNG, GIF (Tối đa 5MB)"
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const validateFile = (file) => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh!');
      return false;
    }
    
    // Check file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File ảnh không được lớn hơn 5MB!');
      return false;
    }

    return true;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!validateFile(file)) return;

      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);

      // Call parent callback
      if (onFileChange) {
        onFileChange(file);
      }
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    
    // Reset file input
    const fileInput = document.getElementById(id);
    if (fileInput) {
      fileInput.value = '';
    }

    // Call parent callback
    if (onFileRemove) {
      onFileRemove();
    }
  };

  return (
    <div className="file-upload-wrapper">
      {label && (
        <label className="file-upload-label">{label}</label>
      )}
      
      <div className="file-upload-container">
        <input
          id={id}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="file-input"
        />
        
        <label htmlFor={id} className="file-upload-btn">
          <i className="bi bi-cloud-upload"></i>
          <span>{selectedFile ? selectedFile.name : placeholder}</span>
        </label>
        
        <div className="file-info">
          <small>{fileInfo}</small>
        </div>
      </div>

      {previewUrl && (
        <div className="file-preview">
          <h4>Xem trước</h4>
          <div className="preview-container">
            <img 
              src={previewUrl} 
              alt="Preview"
              className="preview-image"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="remove-file-btn"
              title="Xóa file"
            >
              <i className="bi bi-trash"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload; 