import { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import AddContactModal from '../components/AddContactModal';
import { api } from '../services/mockApi';
import { Plus } from 'lucide-react';

const InstituteDashboard = () => {
  const [contacts, setContacts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchContacts = async () => {
    const allContacts = await api.getContacts();
    setContacts(allContacts.filter(c => c.role !== 'student'));
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
    { header: 'Role', accessor: 'role', cell: (row) => <span style={{textTransform: 'capitalize'}}>{row.role}</span> },
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
          <h1 className="page-title">Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
            Manage Faculty, Staff, and Stakeholder communications.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          Add / Import Contacts
        </button>
      </header>
      <div className="glass-panel">
        <DataTable columns={columns} data={contacts} />
      </div>
      <AddContactModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        role="faculty" 
        onAddSuccess={handleAddSuccess}
      />
    </div>
  );
};

export default InstituteDashboard;
