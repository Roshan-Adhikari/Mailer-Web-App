import { useState, useEffect } from 'react';
import { api } from '../services/mockApi';
import TypeaheadInput from '../components/TypeaheadInput';
import { Send, Replace } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Compose.css';

const Compose = () => {
  const { token } = useAuth();
  
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [templates, setTemplates] = useState([]);
  
  const [toSelected, setToSelected] = useState([]);
  const [ccSelected, setCcSelected] = useState([]);
  const [bccSelected, setBccSelected] = useState([]);
  
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const [isSending, setIsSending] = useState(false);

  // Simulating variables replacement for preview
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [cData, gData, tData] = await Promise.all([
        api.getContacts(),
        api.getGroups(),
        api.getTemplates()
      ]);
      setContacts(cData);
      
      const mappedGroups = gData.map(g => ({ ...g, type: 'group' }));
      setGroups(mappedGroups);
      setTemplates(tData);
    };
    fetchData();
  }, []);

  const typeaheadOptions = [...contacts, ...groups];

  const handleTemplateChange = (e) => {
    const tId = e.target.value;
    setSelectedTemplateId(tId);
    
    if (tId) {
      const template = templates.find(t => t.id === tId);
      if (template) {
        setSubject(template.subject);
        setBody(template.bodyTemplate);
      }
    } else {
      setSubject('');
      setBody('');
    }
  };

  const getPreviewText = (text) => {
    if (!text) return '';
    return text.replace(/{{(.*?)}}/g, '<span class="var-highlight">[$1]</span>');
  };

  const handleSend = async () => {
    if (toSelected.length === 0) {
      alert("Please add at least one recipient to the 'To' field.");
      return;
    }
    if (!subject) {
      alert("Please enter an email subject.");
      return;
    }
    if (!token) {
      alert("You are not authenticated with Google. Please log in again.");
      return;
    }

    setIsSending(true);

    try {
      // Build RFC 2822 email string
      const toAddresses = toSelected.map(c => c.email).join(', ');
      const ccAddresses = ccSelected.map(c => c.email).join(', ');
      const bccAddresses = bccSelected.map(c => c.email).join(', ');
      
      const emailLines = [];
      emailLines.push(`To: ${toAddresses}`);
      if (ccAddresses) emailLines.push(`Cc: ${ccAddresses}`);
      if (bccAddresses) emailLines.push(`Bcc: ${bccAddresses}`);
      emailLines.push(`Subject: ${subject}`);
      emailLines.push('Content-Type: text/plain; charset="UTF-8"');
      emailLines.push('');
      emailLines.push(body);

      const emailContent = emailLines.join('\r\n');
      
      // Base64url encode the message
      const base64EncodedEmail = btoa(unescape(encodeURIComponent(emailContent)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      // Make request to Gmail API
      const response = await fetch('https://gmail.googleapis.com/upload/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          raw: base64EncodedEmail
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to send email via Gmail API');
      }

      setIsSending(false);
      alert(`Successfully sent ${toSelected.length} email(s) directly via your Gmail!`);
      
      setToSelected([]);
      setCcSelected([]);
      setBccSelected([]);
      setSubject('');
      setBody('');
      setSelectedTemplateId('');
      setPreviewMode(false);

    } catch (error) {
      console.error(error);
      alert("Failed to send email: " + error.message);
      setIsSending(false);
    }
  };

  return (
    <div className="compose-page">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Compose Mail</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
            Send automated emails using dynamic templates.
          </p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={handleSend}
          disabled={isSending}
        >
          <Send size={18} />
          {isSending ? 'Sending...' : 'Send Now'}
        </button>
      </header>

      <div className="compose-layout">
        <div className="compose-form glass-panel">
          
          <div className="routing-section">
            <TypeaheadInput label="To:" options={typeaheadOptions} selected={toSelected} onChange={setToSelected} />
            <TypeaheadInput label="CC:" options={typeaheadOptions} selected={ccSelected} onChange={setCcSelected} />
            <TypeaheadInput label="BCC:" options={typeaheadOptions} selected={bccSelected} onChange={setBccSelected} />
          </div>

          <div className="template-section">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="input-label">Apply Template</label>
              <select className="input-field custom-select" value={selectedTemplateId} onChange={handleTemplateChange}>
                <option value="">-- No Template --</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <button className="btn btn-secondary" onClick={() => setPreviewMode(!previewMode)} style={{ height: '48px', alignSelf: 'flex-end' }}>
              <Replace size={18} /> {previewMode ? 'Edit Mode' : 'Preview Variables'}
            </button>
          </div>

          <div className="editor-section">
            <div className="form-group">
              <label className="input-label">Subject</label>
              {previewMode ? (
                <div className="input-field subject-preview" dangerouslySetInnerHTML={{ __html: getPreviewText(subject) }} />
              ) : (
                <input 
                  type="text" 
                  className="input-field" 
                  value={subject} 
                  onChange={e => setSubject(e.target.value)}
                  placeholder="Email subject..."
                />
              )}
            </div>

            <div className="form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label className="input-label">Body</label>
              {previewMode ? (
                <div className="input-field body-preview" dangerouslySetInnerHTML={{ __html: getPreviewText(body) }} />
              ) : (
                <textarea 
                  className="input-field body-editor" 
                  value={body} 
                  onChange={e => setBody(e.target.value)}
                  placeholder="Compose your email here..."
                ></textarea>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Compose;
