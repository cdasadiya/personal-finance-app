// --- App Configuration & Categories ---
const CATEGORIES = {
  Salary: { emoji: '💰', color: '#10b981' },
  Food: { emoji: '🍔', color: '#f59e0b' },
  Housing: { emoji: '🏠', color: '#3b82f6' },
  Utilities: { emoji: '⚡', color: '#14b8a6' },
  Entertainment: { emoji: '🎬', color: '#a855f7' },
  Transport: { emoji: '🚗', color: '#06b6d4' },
  Shopping: { emoji: '🛍️', color: '#ec4899' },
  Miscellaneous: { emoji: '📦', color: '#6b7280' }
};

// --- State Management ---
let state = {
  transactions: [],
  theme: 'dark',
  filters: {
    search: '',
    category: 'all',
    type: 'all'
  }
};

let chartInstance = null;

// --- Load / Save Data ---
async function init() {
  // Load transactions from SQLite Backend API
  await loadTransactions();

  // Load theme (stored locally since it is a client interface preference)
  const storedTheme = localStorage.getItem('chaitanya_theme') || 'dark';
  state.theme = storedTheme;
  document.documentElement.setAttribute('data-theme', state.theme);
  updateThemeUI();

  // Populate categories selects
  populateCategorySelects();

  // Set default date to today
  document.getElementById('txDate').value = new Date().toISOString().split('T')[0];

  // Attach Event Listeners
  setupEventListeners();

  // Initial renders
  renderApp();
}

async function loadTransactions() {
  try {
    const res = await fetch('/api/transactions');
    if (!res.ok) throw new Error('Failed to fetch transactions from server');
    state.transactions = await res.json();
  } catch (err) {
    console.error(err);
    showToast("Error loading database records. Server might be offline.");
  }
}

// --- DOM Population ---
function populateCategorySelects() {
  const formSelect = document.getElementById('txCategory');
  const filterSelect = document.getElementById('categoryFilter');
  
  // Clear existing
  formSelect.innerHTML = '';
  filterSelect.innerHTML = '<option value="all">All Categories</option>';
  
  Object.keys(CATEGORIES).forEach(cat => {
    const data = CATEGORIES[cat];
    
    // Add to form dropdown
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = `${data.emoji} ${cat}`;
    formSelect.appendChild(option);
    
    // Add to filters dropdown
    const filterOption = document.createElement('option');
    filterOption.value = cat;
    filterOption.textContent = `${data.emoji} ${cat}`;
    filterSelect.appendChild(filterOption);
  });
}

// --- Rendering Core ---
function renderApp() {
  renderSummary();
  renderHistory();
  renderChart();
  
  // Refresh Lucide Icons
  lucide.createIcons();
}

function renderSummary() {
  let income = 0;
  let expense = 0;
  
  state.transactions.forEach(tx => {
    if (tx.type === 'income') {
      income += tx.amount;
    } else {
      expense += tx.amount;
    }
  });
  
  const balance = income - expense;
  
  // Values Formatting
  document.getElementById('valIncome').textContent = formatCurrency(income);
  document.getElementById('valExpense').textContent = formatCurrency(expense);
  
  const valBalanceElement = document.getElementById('valBalance');
  valBalanceElement.textContent = formatCurrency(balance);
  
  // Update Net Balance class/color
  const cardBalance = document.getElementById('cardBalance');
  const subBalance = document.getElementById('subBalance');
  if (balance >= 0) {
    cardBalance.className = 'glass-panel summary-card card-net-balance positive';
    subBalance.textContent = 'Keep track of your positive margins';
  } else {
    cardBalance.className = 'glass-panel summary-card card-net-balance negative';
    subBalance.textContent = 'Net loss registered for this period';
  }

  // Update Dynamic Subtitle for overall expenses
  const subExpense = document.getElementById('subExpense');
  if (income > 0) {
    const percentage = ((expense / income) * 100).toFixed(0);
    subExpense.textContent = `Consuming ${percentage}% of your income`;
  } else {
    subExpense.textContent = 'No income recorded yet';
  }
}

function renderHistory() {
  const listContainer = document.getElementById('transactionList');
  listContainer.innerHTML = '';
  
  // Apply filtering
  const filtered = state.transactions.filter(tx => {
    // Search match
    const searchMatch = tx.description.toLowerCase().includes(state.filters.search.toLowerCase());
    
    // Category match
    const categoryMatch = state.filters.category === 'all' || tx.category === state.filters.category;
    
    // Type match
    const typeMatch = state.filters.type === 'all' || tx.type === state.filters.type;
    
    return searchMatch && categoryMatch && typeMatch;
  });
  
  // Sort transactions by date descending (newest first), fallback to ID order
  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  if (filtered.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon"><i data-lucide="info"></i></div>
        <p>No matching transactions found. Try resetting your filters.</p>
      </div>
    `;
    return;
  }
  
  filtered.forEach(tx => {
    const catData = CATEGORIES[tx.category] || { emoji: '📦', color: '#6b7280' };
    const dateFormatted = formatDate(tx.date);
    
    const txDiv = document.createElement('div');
    txDiv.className = 'transaction-item';
    txDiv.innerHTML = `
      <div class="transaction-info">
        <div class="category-badge-icon" style="background-color: ${catData.color}20; color: ${catData.color}">
          <span>${catData.emoji}</span>
        </div>
        <div class="transaction-meta">
          <span class="tx-title">${escapeHTML(tx.description)}</span>
          <div class="tx-details">
            <span class="tx-category" style="color: ${catData.color};">${tx.category}</span>
            <span>•</span>
            <span>${dateFormatted}</span>
          </div>
        </div>
      </div>
      <div class="transaction-right">
        <span class="tx-amount ${tx.type === 'income' ? 'income' : 'expense'}">
          ${tx.type === 'income' ? '+' : '-'}${formatCurrency(tx.amount)}
        </span>
        <button class="delete-btn" data-id="${tx.id}" title="Delete transaction">
          <i data-lucide="x"></i>
        </button>
      </div>
    `;
    
    listContainer.appendChild(txDiv);
  });
}

// --- Chart Generation ---
function renderChart() {
  const chartCanvas = document.getElementById('expenseChart');
  const chartEmptyState = document.getElementById('chartEmptyState');
  
  // Gather Expense categories sums
  const expenseCategories = {};
  let totalExpenses = 0;
  
  state.transactions.forEach(tx => {
    if (tx.type === 'expense') {
      expenseCategories[tx.category] = (expenseCategories[tx.category] || 0) + tx.amount;
      totalExpenses += tx.amount;
    }
  });
  
  if (totalExpenses === 0) {
    chartCanvas.style.display = 'none';
    chartEmptyState.style.display = 'flex';
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
    return;
  }
  
  chartCanvas.style.display = 'block';
  chartEmptyState.style.display = 'none';
  
  const labels = Object.keys(expenseCategories);
  const dataValues = Object.values(expenseCategories);
  const backgroundColors = labels.map(label => CATEGORIES[label]?.color || '#6b7280');
  
  const isDark = state.theme === 'dark';
  const labelColor = isDark ? '#9ca3af' : '#475569';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
  
  if (chartInstance) {
    chartInstance.destroy();
  }
  
  chartInstance = new Chart(chartCanvas, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: dataValues,
        backgroundColor: backgroundColors,
        borderWidth: isDark ? 2 : 1,
        borderColor: isDark ? '#0f172a' : '#ffffff',
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'right',
          labels: {
            color: labelColor,
            font: {
              family: 'Inter',
              size: 11
            },
            boxWidth: 10,
            padding: 10
          }
        },
        tooltip: {
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          titleColor: isDark ? '#ffffff' : '#0f172a',
          bodyColor: isDark ? '#e2e8f0' : '#334155',
          borderColor: gridColor,
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              const value = context.parsed;
              const percentage = ((value / totalExpenses) * 100).toFixed(1);
              return ` ${context.label}: $${value.toFixed(2)} (${percentage}%)`;
            }
          }
        }
      },
      cutout: '65%'
    }
  });
}

// --- Event Handlers & Event Listeners ---
function setupEventListeners() {
  // Form submission
  const form = document.getElementById('transactionForm');
  form.addEventListener('submit', handleAddTransaction);
  
  // Custom Transaction List deletions
  const listContainer = document.getElementById('transactionList');
  listContainer.addEventListener('click', handleDeleteClick);
  
  // Filters
  document.getElementById('searchFilter').addEventListener('input', e => {
    state.filters.search = e.target.value;
    renderHistory();
  });
  
  document.getElementById('categoryFilter').addEventListener('change', e => {
    state.filters.category = e.target.value;
    renderHistory();
  });
  
  document.getElementById('typeFilter').addEventListener('change', e => {
    state.filters.type = e.target.value;
    renderHistory();
  });
  
  // Theme Toggle
  document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme);
  
  // Clear All Data Modal Triggers
  const clearOverlay = document.getElementById('clearModalOverlay');
  document.getElementById('clearAllBtn').addEventListener('click', () => {
    clearOverlay.classList.add('active');
  });
  
  document.getElementById('cancelClearBtn').addEventListener('click', () => {
    clearOverlay.classList.remove('active');
  });
  
  document.getElementById('confirmClearBtn').addEventListener('click', handleConfirmClear);
  
  // Backup: Export JSON
  document.getElementById('exportBtn').addEventListener('click', handleExportData);
  
  // Backup: Import JSON
  const importInput = document.getElementById('importFileInput');
  document.getElementById('importBtn').addEventListener('click', () => {
    importInput.click();
  });
  importInput.addEventListener('change', handleImportData);
}

async function handleAddTransaction(e) {
  e.preventDefault();
  
  const descInput = document.getElementById('txDesc');
  const amountInput = document.getElementById('txAmount');
  const categorySelect = document.getElementById('txCategory');
  const dateInput = document.getElementById('txDate');
  const typeRadio = document.querySelector('input[name="txType"]:checked');
  
  const description = descInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const category = categorySelect.value;
  const date = dateInput.value;
  const type = typeRadio.value;
  
  // Validation checks
  if (!description) {
    showToast("Please enter a valid description");
    descInput.focus();
    return;
  }
  
  if (isNaN(amount) || amount <= 0) {
    showToast("Amount must be a positive number");
    amountInput.focus();
    return;
  }
  
  if (!date) {
    showToast("Please pick a valid date");
    dateInput.focus();
    return;
  }
  
  const newTx = {
    id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    description,
    amount,
    type,
    category,
    date
  };
  
  try {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newTx)
    });
    
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Failed to insert transaction on server.');
    }
    
    // Add to local state & reset fields
    state.transactions.unshift(newTx);
    descInput.value = '';
    amountInput.value = '';
    
    // Re-render
    renderApp();
  } catch (err) {
    console.error(err);
    showToast("Error adding transaction. Server might be offline.");
  }
}

async function handleDeleteClick(e) {
  const deleteBtn = e.target.closest('.delete-btn');
  if (!deleteBtn) return;
  
  const idToDelete = deleteBtn.getAttribute('data-id');
  
  try {
    const res = await fetch(`/api/transactions/${idToDelete}`, {
      method: 'DELETE'
    });
    
    if (!res.ok) throw new Error('Failed to delete transaction on server.');
    
    state.transactions = state.transactions.filter(tx => tx.id !== idToDelete);
    renderApp();
  } catch (err) {
    console.error(err);
    showToast("Error deleting transaction. Server might be offline.");
  }
}

async function handleConfirmClear() {
  const clearOverlay = document.getElementById('clearModalOverlay');
  
  try {
    const res = await fetch('/api/transactions', {
      method: 'DELETE'
    });
    
    if (!res.ok) throw new Error('Failed to clear database table.');
    
    state.transactions = [];
    renderApp();
    showToast("All database records cleared successfully.");
  } catch (err) {
    console.error(err);
    showToast("Error clearing database. Server offline.");
  } finally {
    clearOverlay.classList.remove('active');
  }
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('chaitanya_theme', state.theme);
  document.documentElement.setAttribute('data-theme', state.theme);
  updateThemeUI();
  
  // Re-draw chart to match new grid lines & label coloring
  renderChart();
}

function updateThemeUI() {
  const sunIcon = document.getElementById('themeSunIcon');
  const moonIcon = document.getElementById('themeMoonIcon');
  
  if (state.theme === 'light') {
    sunIcon.style.display = 'block';
    moonIcon.style.display = 'none';
  } else {
    sunIcon.style.display = 'none';
    moonIcon.style.display = 'block';
  }
}

// --- Import / Export System ---
function handleExportData() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.transactions, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `chaitanyafinance_export_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function handleImportData(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = async function(event) {
    try {
      const importedData = JSON.parse(event.target.result);
      if (Array.isArray(importedData)) {
        const res = await fetch('/api/transactions/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(importedData)
        });
        
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Server rejected import payload.');
        }
        
        state.transactions = importedData;
        renderApp();
        showToast("Database records imported successfully!");
      } else {
        showToast("Invalid JSON file layout");
      }
    } catch (err) {
      showToast("Could not parse JSON file");
      console.error(err);
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

// --- Utility Helpers ---
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

function formatDate(dateStr) {
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  const [year, month, day] = dateStr.split('-');
  const dateObj = new Date(year, month - 1, day);
  return dateObj.toLocaleDateString('en-US', options);
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// Simple floating notification (toast) utility
function showToast(message) {
  let wrapper = document.getElementById('toastWrapper');
  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.id = 'toastWrapper';
    wrapper.style.position = 'fixed';
    wrapper.style.bottom = '2rem';
    wrapper.style.right = '2rem';
    wrapper.style.zIndex = '999';
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.gap = '0.5rem';
    document.body.appendChild(wrapper);
  }
  
  const toast = document.createElement('div');
  toast.style.background = 'rgba(15, 23, 42, 0.9)';
  toast.style.color = '#fff';
  toast.style.border = '1px solid rgba(255,255,255,0.1)';
  toast.style.padding = '0.75rem 1.25rem';
  toast.style.borderRadius = '8px';
  toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
  toast.style.fontFamily = 'Inter, sans-serif';
  toast.style.fontSize = '0.875rem';
  toast.style.fontWeight = '500';
  toast.style.backdropFilter = 'blur(10px)';
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.gap = '0.5rem';
  toast.style.animation = 'slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
  
  toast.innerHTML = `<i data-lucide="info" style="width:16px; color:var(--primary)"></i> <span>${message}</span>`;
  wrapper.appendChild(toast);
  lucide.createIcons();
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Start Application on Load
window.addEventListener('DOMContentLoaded', init);
