import API from "./axios";

const reportApi = {
  // 1. Per Vehicle Report — GET /api/reports/vehicle
  vehicleReport: (params) => API.get("/reports/vehicle", { params }),

  // 2. Vehicle Monthly Report — GET /api/reports/vehicle/monthly
  vehicleMonthlyReport: (params) => API.get("/reports/vehicle/monthly", { params }),

  // 3. Ride Report — GET /api/reports/rides
  rideReport: (params) => API.get("/reports/rides", { params }),

  // 4. Market vs Own Vehicle — GET /api/reports/vehicle-comparison
  marketVsOwnReport: (params) => API.get("/reports/vehicle-comparison", { params }),

  // 5. Party / Client Report — GET /api/reports/party
  partyReport: (params) => API.get("/reports/party", { params }),

  // 6. Invoice Report — GET /api/reports/invoices
  invoiceReport: (params) => API.get("/reports/invoices", { params }),

  // 7. Expense Report — GET /api/reports/expenses
  expenseReport: (params) => API.get("/reports/expenses", { params }),

  // 8. Profit & Loss Report — GET /api/reports/profit-loss
  profitLossReport: (params) => API.get("/reports/profit-loss", { params }),

  // 9. Partner Report — GET /api/reports/partner
  partnerReport: (params) => API.get("/reports/partner", { params }),

  // 10. Daily Summary Report — GET /api/reports/daily-summary
  dailySummaryReport: (params) => API.get("/reports/daily-summary", { params }),

  // 11. Pending & Due Report — GET /api/reports/pending-due
  pendingDueReport: (params) => API.get("/reports/pending-due", { params }),
};

export default reportApi;