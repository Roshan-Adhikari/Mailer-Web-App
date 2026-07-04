import { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import AddContactModal from '../components/AddContactModal';
import { api } from '../services/mockApi';
import { Plus, Upload, ClipboardPaste } from 'lucide-react';

const StudentDashboard = () => {
  const [contacts, setContacts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchContacts = async () => {
    const allContacts = await api.getContacts();
    setContacts(allContacts.filter(c => c.role === 'student'));
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleAddSuccess = async (newContacts) => {
    for (const contact of newContacts) {
      await api.addContact(contact);
    }
    fetchContacts();
    setIsModalOpen(false);
  };

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Tags', accessor: 'tags', cell: (row) => (
      <div>
        {row.tags.map(tag => <span key={tag} className="tag-pill">{tag}</span>)}
      </div>
    )}
  ];

  return (
    <div>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Student Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
            Manage Student communications and dynamic batch groups.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            Add / Import Students
          </button>
        </div>
      </header>
      <div className="glass-panel">
        <DataTable columns={columns} data={contacts} />
      </div>
      <AddContactModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        role="student" 
        onAddSuccess={handleAddSuccess}
      />
    </div>
  );
};

export default StudentDashboard;
