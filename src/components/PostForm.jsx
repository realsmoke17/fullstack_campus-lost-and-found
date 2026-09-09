import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addItem } from '../firebase/firestore';
import CameraCapture from './CameraCapture';
import { useAuth } from '../context/AuthContext';

const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > 1200) {
          height = Math.round((height * 1200) / width);
          width = 1200;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name || 'image.jpg', {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        }, 'image/jpeg', 0.8);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

const PostForm = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  const useStates = {
    title: '',
    category: 'Electronics',
    status: 'lost',
    description: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
  };

  const [formData, setFormData] = useState(useStates);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("You must be logged in to post an item.");
      return;
    }

    if (!user.emailVerified) {
      alert("Please verify your TUT4life email address before posting items. Check your inbox for the verification link!");
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      let photoURL = `https://via.placeholder.com/150?text=No+Image`;

      if (selectedFile) {
        try {
          const compressedFile = await compressImage(selectedFile);
          
          const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
          const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

          const formDataCloudinary = new FormData();
          formDataCloudinary.append('file', compressedFile);
          formDataCloudinary.append('upload_preset', uploadPreset);

          const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
              method: 'POST',
              body: formDataCloudinary,
            }
          );

          if (!response.ok) {
            throw new Error(`Cloudinary upload failed: ${response.statusText}`);
          }

          const data = await response.json();
          photoURL = data.secure_url;
        } catch (uploadError) {
          console.error("Cloudinary Error:", uploadError);
          alert("Photo upload failed. Please check your image or try again later.");
          setIsSubmitting(false);
          return;
        }
      }

      const newItemData = {
        ...formData,
        image: photoURL,
        postedByStudentNumber: userProfile?.studentNumber || 'Unknown Student',
      };

      try {
        await addItem(newItemData, userProfile);
        setSuccessMessage('Item posted successfully!');
        setTimeout(() => {
          navigate('/board');
        }, 1500);
      } catch (firestoreError) {
        console.error("Firestore Error:", firestoreError);
        alert("Item details could not be saved. Your photo was uploaded, but the record failed.");
        setIsSubmitting(false);
        return;
      }
    } catch (generalError) {
      console.error("General Error:", generalError);
      alert("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const categories = ['Electronics', 'Keys', 'Bags', 'ID/Cards', 'Other'];

  return (
    <>
      <div className="container">
        <header className="header">
          <h1>Post a New Item</h1>
          <p>Let the campus community know what's missing or found!</p>
        </header>
        
        {successMessage && (
          <div className="status-message status-message--success" style={{ marginBottom: '20px' }}>
            {successMessage}
          </div>
        )}

        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Item Title</label>
              <input
                type="text"
                name="title"
                className="form-input"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Blue Water Bottle"
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                name="category"
                className="form-select"
                value={formData.category}
                onChange={handleChange}
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <div className="toggle-group toggle-group--fit">
                <button
                  type="button"
                  className={`toggle-btn ${formData.status === 'lost' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, status: 'lost' }))}
                >
                  Lost
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${formData.status === 'found' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, status: 'found' }))}
                >
                  Found
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                className="form-textarea"
                rows="4"
                required
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the item in detail..."
              ></textarea>
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                className="form-input"
                required
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Student Union, 2nd floor"
              />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                name="date"
                className="form-input"
                required
                value={formData.date}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Photo</label>
              
              {previewUrl && (
                <div className="image-preview">
                  <img src={previewUrl} alt="Preview" className="image-preview__img" />
                  <button 
                    type="button" 
                    className="image-preview__remove"
                    onClick={() => setSelectedFile(null)}
                    aria-label="Remove photo"
                  >
                    ✕
                  </button>
                </div>
              )}

              {!previewUrl && (
                <div className="photo-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsCameraOpen(true)}
                  >
                    Take Photo
                  </button>
                  <label className="btn btn-secondary upload-label">
                    Upload from Gallery
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              )}
              <p className="form-hint">
                Upload a clear photo to help others identify the item.
              </p>
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/board')}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Posting...' : 'Post Item 🚀'}
              </button>
            </div>
          </form>
        </div>
      </div>
      {isCameraOpen && (
        <CameraCapture
          onCapture={(file) => {
            setSelectedFile(file);
            setIsCameraOpen(false);
          }}
          onClose={() => setIsCameraOpen(false)}
        />
      )}
    </>
  );
};

export default PostForm;
