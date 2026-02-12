import API from "./axios";

const partnerLedgerApi = {
  // Get ledger entries with optional date range and pagination
  getEntries: (partnerId, params) =>
    API.get(`/partners/${partnerId}/ledger`, { params }),

  // Add new ledger entry
  addEntry: (partnerId, data) =>
    API.post(`/partners/${partnerId}/ledger`, data),

  // Get specific entry
  getEntry: (partnerId, entryId) =>
    API.get(`/partners/${partnerId}/ledger/${entryId}`),

  // Update ledger entry
  updateEntry: (partnerId, entryId, data) =>
    API.put(`/partners/${partnerId}/ledger/${entryId}`, data),

  // Delete ledger entry
  deleteEntry: (partnerId, entryId) =>
    API.delete(`/partners/${partnerId}/ledger/${entryId}`),

  // Get ledger summary
  getSummary: (partnerId) =>
    API.get(`/partners/${partnerId}/ledger-summary`),

  // Set opening balance
  setOpeningBalance: (partnerId, data) =>
    API.post(`/partners/${partnerId}/ledger/opening-balance`, data),
};

export default partnerLedgerApi;