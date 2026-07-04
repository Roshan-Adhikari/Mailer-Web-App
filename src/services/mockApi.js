export const mockContacts = [];
export const mockGroups = [];
export const mockTemplates = [];

// Simple mock service simulating async behavior
export const api = {
  getContacts: async () => [...mockContacts],
  getGroups: async () => [...mockGroups],
  getTemplates: async () => [...mockTemplates],
  addContact: async (contact) => {
    mockContacts.push({ id: Date.now().toString() + Math.random(), ...contact });
    return true;
  },
  addGroup: async (group) => {
    mockGroups.push({ id: Date.now().toString(), ...group });
    return true;
  },
  saveTemplate: async (template) => {
    const idx = mockTemplates.findIndex(t => t.id === template.id);
    if (idx >= 0) {
      mockTemplates[idx] = template;
    } else {
      mockTemplates.push({ ...template, id: template.id.startsWith('new-') ? Date.now().toString() : template.id });
    }
    return true;
  },
  deleteTemplate: async (id) => {
    const idx = mockTemplates.findIndex(t => t.id === id);
    if (idx >= 0) {
      mockTemplates.splice(idx, 1);
    }
    return true;
  }
};
