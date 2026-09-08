import React, { useState } from 'react';
import { addItem } from '../firebase/firestore';

const PostForm = ({ onPostItem, onBack }) => {
  const useStates = {
    title: '',
    category: 'Electronics',
    status: 'lost',
    description: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    poster: 'Current User'
  };

  const [formData, setFormData] = useState(useStates);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let photoURL = `https://via.placeholder.com/150?text=No+Image`;

      // 1. Upload photo to Cloudinary if selected
      if (selectedFile) {
        try {
          const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
          const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

          const formDataCloudinary = new FormData();
          formDataCloudinary.append('file', selectedFile);
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
          // Failure Case 1: Cloudinary upload fails
          console.error("Cloudinary Error:", uploadError);
          alert("Photo upload failed. Please check your image or try again later.");
          setIsSubmitting(false);
          return; // STOP: Do NOT write to Firestore if upload fails
        }
      }

      // 2. Prepare item data
      const newItemData = {
        ...formData,
        image: photoURL,
      };

      // 3. Save to Firestore
      try {
        await addItem(newItemData);
      } catch (firestoreError) {
        // Failure Case 2: Firestore write fails after successful upload
        console.error("Firestore Error:", firestoreError);
        alert("Item details could not be saved. Your photo was uploaded, but the record failed.");
        setIsSubmitting(false);
        return;
      }

      // 4. Success: notify parent to refresh and navigate back
      onPostItem();
    } catch (generalError) {
      console.error("General Error:", generalError);
      alert("An unexpected error occurred. Please try again.");
    } finally {
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
    <div className="container">
      <header className="header">
        <h1>Post a New Item</h1>
        <p>Let the campus community know what's missing or found!</p>
      </header>

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
            <div className="toggle-group" style={{ width: 'fit-content' }}>
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
            <input
              type="file"
              className="form-input"
              accept="image/*"
              onChange={handleFileChange}
            />
            <p style={{ fontSize: '0.8rem', color: '#7f8c8d', marginTop: '5px' }}>
              Upload a clear photo to help others identify the item.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '30px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onBack}
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
  );
};

export default PostForm;
