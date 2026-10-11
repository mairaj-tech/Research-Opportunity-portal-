// Research Opportunity Portal — Frontend JavaScript
const API_BASE = 'http://localhost:3000/api/opportunities';

let editingId = null; // null = create mode, number = edit mode

// ── Utility: show alert ──────────────────────────────────────────────────────
function showAlert(message, type = 'success') {
  const container = document.getElementById('alert-container');
  const id = 'alert-' + Date.now();
  const html = `
    <div id="${id}" class="alert alert-${type} alert-dismissible fade show shadow" role="alert">
      ${escapeHtml(message)}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>`;
  container.insertAdjacentHTML('beforeend', html);
  setTimeout(() => {
    const el = document.getElementById(id);
    if (el) el.remove();
  }, 4000);
}

function escapeHtml(text) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(String(text)));
  return d.innerHTML;
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ── Fetch & Render all opportunities ─────────────────────────────────────────
async function fetchAllOpportunities() {
  const grid = document.getElementById('opportunities-grid');
  const noResults = document.getElementById('no-results');
  grid.innerHTML = '<div class="col-12 text-center py-5"><div class="spinner-border text-primary" role="status"></div></div>';

  try {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error('Failed to fetch opportunities');
    const data = await res.json();

    grid.innerHTML = '';
    if (data.length === 0) {
      noResults.classList.remove('d-none');
      return;
    }
    noResults.classList.add('d-none');

    data.forEach(opp => {
      const statusClass = opp.status === 'Open' ? 'status-badge-open' : 'status-badge-closed';
      const card = `
        <div class="col-md-6 col-lg-4 mb-4">
          <div class="card opportunity-card p-3">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h5 class="card-title mb-0">${escapeHtml(opp.title)}</h5>
              <span class="${statusClass} ms-2 text-nowrap">${escapeHtml(opp.status)}</span>
            </div>
            <p class="card-meta mb-1"><i class="bi bi-person-fill me-1"></i>${escapeHtml(opp.faculty_name)}</p>
            <p class="card-meta mb-1"><i class="bi bi-building me-1"></i>${escapeHtml(opp.department)}</p>
            <p class="card-meta mb-1"><i class="bi bi-search me-1"></i>${escapeHtml(opp.research_area)}</p>
            <p class="card-meta mb-2"><i class="bi bi-calendar3 me-1"></i>Deadline: ${formatDate(opp.application_deadline)}</p>
            <p class="card-meta mb-3"><i class="bi bi-people-fill me-1"></i>Positions: ${opp.available_positions}</p>
            <div class="d-flex gap-2">
              <button class="btn btn-primary btn-sm flex-fill" onclick="viewDetails(${opp.id})">View Details</button>
              <button class="btn btn-danger btn-sm" onclick="deleteOpportunity(${opp.id})"><i class="bi bi-trash"></i></button>
            </div>
          </div>
        </div>`;
      grid.insertAdjacentHTML('beforeend', card);
    });
  } catch (err) {
    grid.innerHTML = '';
    showAlert('Error loading opportunities: ' + err.message, 'danger');
  }
}

// ── View Details Modal ────────────────────────────────────────────────────────
async function viewDetails(id) {
  try {
    const res = await fetch(`${API_BASE}/${id}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Not found');
    }
    const opp = await res.json();

    document.getElementById('modal-title').textContent = opp.title;
    document.getElementById('modal-faculty').textContent = opp.faculty_name;
    document.getElementById('modal-department').textContent = opp.department;
    document.getElementById('modal-area').textContent = opp.research_area;
    document.getElementById('modal-skills').textContent = opp.required_skills;
    document.getElementById('modal-positions').textContent = opp.available_positions;
    document.getElementById('modal-deadline').textContent = formatDate(opp.application_deadline);
    document.getElementById('modal-description').textContent = opp.description;

    const statusEl = document.getElementById('modal-status');
    statusEl.textContent = opp.status;
    statusEl.className = opp.status === 'Open' ? 'status-badge-open' : 'status-badge-closed';

    const closeBtn = document.getElementById('modal-close-btn');
    if (opp.status === 'Closed') {
      closeBtn.style.display = 'none';
    } else {
      closeBtn.style.display = '';
      closeBtn.onclick = () => closeOpportunity(opp.id);
    }

    document.getElementById('modal-edit-btn').onclick = () => {
      populateFormForEdit(opp);
      bootstrap.Modal.getInstance(document.getElementById('detailModal')).hide();
    };

    new bootstrap.Modal(document.getElementById('detailModal')).show();
  } catch (err) {
    showAlert('Error loading details: ' + err.message, 'danger');
  }
}

// ── Create / Update ───────────────────────────────────────────────────────────
async function handleFormSubmit(e) {
  e.preventDefault();
  clearFormErrors();

  const fields = {
    title: document.getElementById('f-title').value.trim(),
    description: document.getElementById('f-description').value.trim(),
    research_area: document.getElementById('f-research_area').value.trim(),
    faculty_name: document.getElementById('f-faculty_name').value.trim(),
    department: document.getElementById('f-department').value.trim(),
    required_skills: document.getElementById('f-required_skills').value.trim(),
    available_positions: document.getElementById('f-available_positions').value.trim(),
    application_deadline: document.getElementById('f-application_deadline').value.trim(),
    status: document.getElementById('f-status').value.trim()
  };

  // Client-side validation
  let valid = true;
  for (const [key, val] of Object.entries(fields)) {
    if (!val) {
      document.getElementById(`err-${key}`)?.classList.remove('d-none');
      valid = false;
    }
  }
  const positions = parseInt(fields.available_positions, 10);
  if (isNaN(positions) || positions < 1) {
    document.getElementById('err-available_positions')?.classList.remove('d-none');
    valid = false;
  }
  if (!valid) return;

  try {
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_BASE}/${editingId}` : API_BASE;

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...fields, available_positions: positions })
    });

    const data = await res.json();
    if (!res.ok) {
      showAlert(data.message || 'Request failed', 'danger');
      return;
    }

    showAlert(editingId ? 'Opportunity updated successfully!' : 'Opportunity created successfully!');
    resetForm();
    fetchAllOpportunities();
  } catch (err) {
    showAlert('Error: ' + err.message, 'danger');
  }
}

function populateFormForEdit(opp) {
  editingId = opp.id;
  document.getElementById('f-title').value = opp.title;
  document.getElementById('f-description').value = opp.description;
  document.getElementById('f-research_area').value = opp.research_area;
  document.getElementById('f-faculty_name').value = opp.faculty_name;
  document.getElementById('f-department').value = opp.department;
  document.getElementById('f-required_skills').value = opp.required_skills;
  document.getElementById('f-available_positions').value = opp.available_positions;
  // Format deadline to yyyy-mm-dd for date input
  const d = new Date(opp.application_deadline);
  document.getElementById('f-application_deadline').value = d.toISOString().split('T')[0];
  document.getElementById('f-status').value = opp.status;

  document.getElementById('form-heading').textContent = 'Edit Opportunity';
  document.getElementById('form-submit-btn').textContent = 'Update Opportunity';
  document.getElementById('form-section').style.display = 'block';
  document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' });
}

function resetForm() {
  editingId = null;
  document.getElementById('opportunity-form').reset();
  clearFormErrors();
  document.getElementById('form-heading').textContent = 'Post New Opportunity';
  document.getElementById('form-submit-btn').textContent = 'Create Opportunity';
  document.getElementById('form-section').style.display = 'none';
}

function clearFormErrors() {
  document.querySelectorAll('.field-error').forEach(el => el.classList.add('d-none'));
}

// ── Delete ────────────────────────────────────────────────────────────────────
async function deleteOpportunity(id) {
  if (!confirm('Are you sure you want to delete this opportunity? This cannot be undone.')) return;
  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) {
      showAlert(data.message || 'Delete failed', 'danger');
      return;
    }
    showAlert('Opportunity deleted successfully.');
    fetchAllOpportunities();
  } catch (err) {
    showAlert('Error: ' + err.message, 'danger');
  }
}

// ── Close Opportunity ─────────────────────────────────────────────────────────
async function closeOpportunity(id) {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Closed' })
    });
    const data = await res.json();
    if (!res.ok) {
      showAlert(data.message || 'Failed to close opportunity', 'danger');
      return;
    }
    bootstrap.Modal.getInstance(document.getElementById('detailModal'))?.hide();
    showAlert('Opportunity status set to Closed.');
    fetchAllOpportunities();
  } catch (err) {
    showAlert('Error: ' + err.message, 'danger');
  }
}

// ── Toggle Form ───────────────────────────────────────────────────────────────
function toggleForm() {
  const section = document.getElementById('form-section');
  if (section.style.display === 'none' || section.style.display === '') {
    resetForm();
    section.style.display = 'block';
    document.getElementById('form-heading').textContent = 'Post New Opportunity';
    section.scrollIntoView({ behavior: 'smooth' });
  } else {
    section.style.display = 'none';
  }
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  fetchAllOpportunities();
  document.getElementById('opportunity-form').addEventListener('submit', handleFormSubmit);
});
