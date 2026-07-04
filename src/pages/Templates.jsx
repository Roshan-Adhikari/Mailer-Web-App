import { useState, useEffect } from 'react';
import { api } from '../services/mockApi';
import { Plus, Save, Trash2, FileText } from 'lucide-react';
import './Templates.css';

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    const data = await api.getTemplates();
    setTemplates(data);
    if (data.length > 0 && !activeTemplate) {
      setActiveTemplate(data[0]);
    }
  };

  const handleNewTemplate = () => {
    const newTemp = {
      id: 'new-' + Date.now(),
      name: 'Untitled Template',
      subject: '',
      bodyTemplate: '',
      variables: []
    };
    setActiveTemplate(newTemp);
    setIsEditing(true);
  };

  const extractVariables = (text) => {
    const regex = /{{(.*?)}}/g;
    const matches = [...text.matchAll(regex)];
    return [...new Set(matches.map(m => m[1].trim()))];
  };

  const handleSave = async () => {
    // Extract variables from subject and body
    const bodyVars = extractVariables(activeTemplate.bodyTemplate);
    const subjectVars = extractVariables(activeTemplate.subject);
    const allVars = [...new Set([...bodyVars, ...subjectVars])];
    
    const templateToSave = { ...activeTemplate, variables: allVars };
    
    await api.saveTemplate(templateToSave);
    
    setIsEditing(false);
    fetchTemplates();
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      if (!activeTemplate.id.startsWith('new-')) {
        await api.deleteTemplate(activeTemplate.id);
      }
      setActiveTemplate(null);
      setIsEditing(false);
      fetchTemplates();
    }
  };

  return (
    <div className="templates-page">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Template Builder</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
            Create and manage reusable email templates with dynamic {"{{variables}}"}.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleNewTemplate}>
          <Plus size={18} />
          New Template
        </button>
      </header>

      <div className="templates-layout">
        <div className="templates-sidebar glass-panel">
          <h3 className="sidebar-title">All Templates</h3>
          <ul className="template-list">
            {templates.map(tpl => (
              <li 
                key={tpl.id} 
                className={`template-item ${activeTemplate?.id === tpl.id ? 'active' : ''}`}
                onClick={() => { setActiveTemplate(tpl); setIsEditing(false); }}
              >
                <FileText size={18} />
                <span>{tpl.name}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="template-editor glass-panel">
          {activeTemplate ? (
            <div className="editor-content">
              <div className="editor-header">
                {isEditing ? (
                  <input 
                    type="text" 
                    className="input-field template-name-input" 
                    value={activeTemplate.name}
                    onChange={(e) => setActiveTemplate({...activeTemplate, name: e.target.value})}
                    placeholder="Template Name"
                  />
                ) : (
                  <h2>{activeTemplate.name}</h2>
                )}
                
                <div className="editor-actions" style={{ display: 'flex', gap: '8px' }}>
                  {!activeTemplate.id.startsWith('new-') && !isEditing && (
                    <button className="btn btn-secondary" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={handleDelete}>
                      <Trash2 size={16} /> Delete
                    </button>
                  )}
                  {isEditing ? (
                    <button className="btn btn-primary" onClick={handleSave}><Save size={16} /> Save</button>
                  ) : (
                    <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>Edit</button>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="input-label">Email Subject</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={activeTemplate.subject}
                  onChange={(e) => setActiveTemplate({...activeTemplate, subject: e.target.value})}
                  disabled={!isEditing}
                  placeholder="e.g. Welcome to {{Institute_Name}}"
                />
              </div>

              <div className="form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <label className="input-label">Email Body (Use {'{{Variable}}'} for dynamic content)</label>
                <textarea 
                  className="input-field body-textarea" 
                  value={activeTemplate.bodyTemplate}
                  onChange={(e) => setActiveTemplate({...activeTemplate, bodyTemplate: e.target.value})}
                  disabled={!isEditing}
                  placeholder="Dear {{First_Name}},&#10;&#10;Write your email here..."
                ></textarea>
              </div>
              
              <div className="variables-section">
                <p className="input-label">Detected Variables:</p>
                <div className="variable-pills">
                  {activeTemplate.variables?.length > 0 ? (
                    activeTemplate.variables.map(v => <span key={v} className="tag-pill bg-accent">{v}</span>)
                  ) : (
                    <span className="text-muted">None detected. Type {'{{Var_Name}}'} to add one.</span>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="empty-state">Select a template or create a new one.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Templates;
