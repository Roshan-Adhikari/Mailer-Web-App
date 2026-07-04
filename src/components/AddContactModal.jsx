import { useState } from 'react';
import { X, Upload, ClipboardPaste, UserPlus } from 'lucide-react';
import './AddContactModal.css';

const AddContactModal = ({ isOpen, onClose, role = 'student', onAddSuccess }) => {
  const [activeTab, setActiveTab] = useState('single');
  const [formData, setFormData] = useState({ name: '', email: '', tags: '' });
  const [bulkText, setBulkText] = useState('');

  if (!isOpen) return null;

  const handleSingleSubmit = (e) => {
    e.preventDefault();
    const newContact = {
      name: formData.name,
      email: formData.email,
      role: role,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    };
    onAddSuccess([newContact]);
    setFormData({ name: '', email: '', tags: '' });
  };

  const handleBulkSubmit = (e) => {
    e.preventDefault();
    // Simple email extraction regex
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    const emails = bulkText.match(emailRegex) || [];
    const uniqueEmails = [...new Set(emails)];
    
    const newContacts = uniqueEmails.map(email => ({
      name: email.split('@')[0], // placeholder name
      email: email,
      role: role,
      tags: ['Bulk Import']
    }));
    
    onAddSuccess(newContacts);
    setBulkText('');
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const rows = text.split('\n').filter(Boolean);
        const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
        
        const newContacts = rows.slice(1).map(row => {
          const values = row.split(',');
          const contact = { role: role, tags: ['CSV Import'] };
          headers.forEach((header, index) => {
            if (header.includes('name')) contact.name = values[index]?.trim();
            if (header.includes('email')) contact.email = values[index]?.trim();
          });
          return contact;
        }).filter(c => c.email);
        
        onAddSuccess(newContacts);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel">
        <div className="modal-header">
          <h2>Add Contact(s)</h2>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="modal-tabs">
          <button className={`tab-btn ${activeTab === 'single' ? 'active' : ''}`} onClick={() => setActiveTab('single')}>
            <UserPlus size={16} /> Single
          </button>
          <button className={`tab-btn ${activeTab === 'bulk' ? 'active' : ''}`} onClick={() => setActiveTab('bulk')}>
            <ClipboardPaste size={16} /> Bulk Paste
          </button>
          <button className={`tab-btn ${activeTab === 'csv' ? 'active' : ''}`} onClick={() => setActiveTab('csv')}>
            <Upload size={16} /> CSV Upload
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'single' && (
            <form onSubmit={handleSingleSubmit} className="single-form">
              <div className="form-group">
                <label className="input-label">Name</label>
                <input type="text" className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="input-label">Email</label>
                <input type="email" className="input-field" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="input-label">Tags (comma separated)</label>
                <input type="text" className="input-field" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} placeholder="e.g. Science, Year 1" />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>Add Contact</button>
            </form>
          )}

          {activeTab === 'bulk' && (
            <form onSubmit={handleBulkSubmit} className="bulk-form">
              <div className="form-group">
                <label className="input-label">Paste emails (comma or newline separated)</label>
                <textarea 
                  className="input-field" 
                  rows="6" 
                  value={bulkText}
                  onChange={e => setBulkText(e.target.value)}
                  placeholder="john@example.com, jane@example.com&#10;test@example.com"
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Extract & Add Emails</button>
            </form>
          )}

          {activeTab === 'csv' && (
            <div className="csv-upload-area">
              <Upload size={40} className="upload-icon" />
              <p>Upload a CSV file containing Name and Email columns.</p>
              <input type="file" accept=".csv" onChange={handleCSVUpload} className="file-input" id="csvUpload" />
              <label htmlFor="csvUpload" className="btn btn-secondary">Select File</label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddContactModal;
