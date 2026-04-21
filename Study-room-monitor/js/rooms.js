async function fetchRooms() {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .order('building', { ascending: true })
    .order('room_number', { ascending: true });
  if (error) throw error;
  return data;
}

async function updateRoomStatus(roomId, status, notes = null) {
  const updateData = {
    status,
    reported_by: currentUser?.id,
    reported_at: new Date().toISOString(),
  };
  if (notes) updateData.notes = notes;
  const { data, error } = await supabase
    .from('rooms')
    .update(updateData)
    .eq('id', roomId)
    .select();
  if (error) throw error;
  return data;
}

function getStatusBadge(status) {
  const classes = {
    'Operational': 'status-operational',
    'Occupied': 'status-occupied',
    'Maintenance': 'status-maintenance'
  };
  return `<span class="status-badge ${classes[status] || ''}">${status}</span>`;
}

async function renderDashboard() {
  const container = document.getElementById('view-container');
  container.innerHTML = `
    <h2>Study Rooms</h2>
    <div id="rooms-loading">Loading rooms...</div>
    <div id="rooms-container"></div>
  `;
  try {
    const rooms = await fetchRooms();
    const roomsContainer = document.getElementById('rooms-container');
    document.getElementById('rooms-loading').style.display = 'none';
    
    const byBuilding = rooms.reduce((acc, room) => {
      if (!acc[room.building]) acc[room.building] = [];
      acc[room.building].push(room);
      return acc;
    }, {});
    
    let html = '';
    for (const [building, buildingRooms] of Object.entries(byBuilding)) {
      html += `<h3>${building}</h3><div class="room-grid">`;
      buildingRooms.forEach(room => {
        const timeAgo = room.reported_at ? new Date(room.reported_at).toLocaleString() : 'No reports';
        html += `
          <div class="room-card">
            <div class="room-header">
              <span class="room-number">Room ${room.room_number}</span>
              ${getStatusBadge(room.status)}
            </div>
            <div class="room-building">Capacity: ${room.capacity || 'N/A'} people</div>
            ${room.notes ? `<p><small>📝 ${room.notes}</small></p>` : ''}
            <div class="room-footer">
              <small>Updated: ${timeAgo}</small>
              ${currentUser ? `<button class="secondary small update-status-btn" data-room-id="${room.id}">Update</button>` : ''}
            </div>
          </div>
        `;
      });
      html += '</div>';
    }
    roomsContainer.innerHTML = html;
    
    if (currentUser) {
      document.querySelectorAll('.update-status-btn').forEach(btn => {
        btn.addEventListener('click', () => showStatusModal(btn.dataset.roomId));
      });
    }
  } catch (error) {
    document.getElementById('rooms-loading').innerHTML = '<p class="text-error">Error loading rooms.</p>';
  }
}

function showStatusModal(roomId) {
  const statuses = ['Operational', 'Occupied', 'Maintenance'];
  const newStatus = prompt(`Select new status:\n${statuses.join('\n')}`);
  if (!newStatus || !statuses.includes(newStatus)) return;
  const notes = prompt('Add a note (optional):');
  updateRoomStatus(roomId, newStatus, notes)
    .then(() => { alert('Room updated!'); renderDashboard(); })
    .catch(() => alert('Error updating room.'));
}

function renderReportPage() {
  if (!currentUser) { window.location.hash = '/login'; return; }
  const container = document.getElementById('view-container');
  container.innerHTML = `
    <h2>Report Room Issue</h2>
    <form id="report-form">
      <label>Select Room <select id="room-select" required><option value="">-- Select --</option></select></label>
      <label>Status <select id="status-select" required>
        <option value="">-- Select --</option>
        <option value="Operational">✅ Operational</option>
        <option value="Occupied">👥 Occupied</option>
        <option value="Maintenance">🔧 Maintenance</option>
      </select></label>
      <label>Notes (optional) <textarea id="report-notes"></textarea></label>
      <div id="report-error" class="text-error"></div>
      <button type="submit">Submit Report</button>
    </form>
  `;
  fetchRooms().then(rooms => {
    const select = document.getElementById('room-select');
    rooms.forEach(room => {
      const option = document.createElement('option');
      option.value = room.id;
      option.textContent = `${room.building} - Room ${room.room_number}`;
      select.appendChild(option);
    });
  });
  document.getElementById('report-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const roomId = document.getElementById('room-select').value;
    const status = document.getElementById('status-select').value;
    const notes = document.getElementById('report-notes').value;
    if (!roomId || !status) return;
    try {
      await updateRoomStatus(roomId, status, notes);
      alert('Report submitted!');
      window.location.hash = '/';
    } catch (error) {
      document.getElementById('report-error').textContent = 'Error submitting.';
    }
  });
}