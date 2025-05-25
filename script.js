let eventsData = [];
let editingEventId = null;

// Load events when the DOM contents are ready
document.addEventListener("DOMContentLoaded", () => {
  loadEvents();
  setupDarkMode();
});

// Fetch events from the backend
async function loadEvents() {
  try {
    const res = await fetch("http://localhost:5000/events");
    if (!res.ok) throw new Error("Failed to fetch events");
    eventsData = await res.json();
    displayEvents(eventsData);
    displayTrendingEvents(eventsData);
    hideEventDetail();
  } catch (err) {
    alert("Error loading events: " + err.message);
  }
}

// Render events to the page
function displayEvents(events) {
  const eventList = document.getElementById("eventList");
  if (events.length === 0) {
    eventList.innerHTML = "<p>No events found.</p>";
    return;
  }
  eventList.innerHTML = events
    .map(
      (event, index) => `
      <div class="col-md-6 event-card" style="--card-index:${index + 1}">
        <div>
          ${event.image ? `<img src="http://localhost:5000${event.image}" class="event-img mb-2" alt="Event Image" />` : ""}
          <h5>${event.name}</h5>
          <p><strong>Date:</strong> ${formatDate(event.date)}</p>
          <p><strong>Location:</strong> ${event.location}</p>
          <p><strong>Participants:</strong> ${event.participants}</p>
          <p><strong>Type:</strong> ${event.type}</p>
          <button class="btn btn-sm btn-outline-primary me-2" onclick="openEditModal('${event._id}')">Edit</button>
          <button class="btn btn-delete btn-sm" onclick="deleteEvent('${event._id}')">Delete</button>
        </div>
      </div>
    `
    )
    .join("");
  eventList.style.display = "flex";
  document.getElementById("eventDetail").style.display = "none";
  document.getElementById("eventListTitle").textContent = "Upcoming Events";
}

// Format date for display
function formatDate(dateStr) {
  const date = new Date(dateStr);
  if (isNaN(date)) return dateStr;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Delete event and refresh list
async function deleteEvent(eventId) {
  if (!confirm("Are you sure you want to delete this event?")) return;
  try {
    await fetch(`http://localhost:5000/delete-event/${eventId}`, { method: "DELETE" });
    loadEvents();
  } catch (err) {
    alert("Error deleting event: " + err.message);
  }
}

// Handle Create Event form submission from the modal
document.getElementById("createEventForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  if (Number(formData.get("participants")) < 0) {
    alert("Participants cannot be negative.");
    return;
  }

  let url = "http://localhost:5000/add-event";
  let method = "POST";

  // If editing, switch to update endpoint
  if (editingEventId) {
    url = `http://localhost:5000/update-event/${editingEventId}`;
    method = "PUT";
  }

  await fetch(url, {
    method,
    body: formData
  });

  // Close the modal (using Bootstrap's modal method)
  const createModal = bootstrap.Modal.getInstance(document.getElementById('createEventModal'));
  createModal.hide();
  form.reset();
  editingEventId = null;
  document.getElementById("modalTitle").textContent = "Create Event";
  loadEvents();
});

// Populate and open the edit modal
window.openEditModal = function(eventId) {
  const event = eventsData.find(ev => ev._id === eventId);
  if (!event) return;
  editingEventId = eventId;
  document.getElementById("modalTitle").textContent = "Edit Event";
  document.getElementById("createEventName").value = event.name;
  document.getElementById("createEventDate").value = event.date ? event.date.slice(0,10) : "";
  document.getElementById("createEventLocation").value = event.location;
  document.getElementById("createParticipants").value = event.participants;
  document.getElementById("createEventType").value = event.type;
  // Image: leave blank, user can upload a new image if desired
  const createModal = new bootstrap.Modal(document.getElementById('createEventModal'));
  createModal.show();
};

// Trending Events logic (make each clickable)
function displayTrendingEvents(events) {
  const trending = [...events]
    .sort((a, b) => b.participants - a.participants)
    .slice(0, 3);

  const trendingContainer = document.getElementById("trendingEvents");
  if (!trendingContainer) return;
  if (!trending.length) {
    trendingContainer.innerHTML = "<p>No trending events.</p>";
    return;
  }

  trendingContainer.innerHTML = trending
    .map(event => `
      <div class="trending-event mb-3 trending-clickable" data-id="${event._id}" style="cursor:pointer;">
        <h6 class="mb-1">${event.name}</h6>
        <p class="mb-0 small text-muted">${event.participants} participants</p>
      </div>
    `)
    .join("");

  trendingContainer.querySelectorAll(".trending-event").forEach(el => {
    el.addEventListener("click", function() {
      const eventId = this.getAttribute("data-id");
      showEventDetail(eventId);
    });
  });
}

// Show event detail in the event list panel
function showEventDetail(eventId) {
  const event = eventsData.find(ev => ev._id === eventId);
  if (!event) return;
  document.getElementById("eventList").style.display = "none";
  document.getElementById("eventListTitle").textContent = "Event Details";
  const detailDiv = document.getElementById("eventDetail");
  detailDiv.style.display = "block";
  detailDiv.innerHTML = `
    <div class="event-card">
      ${event.image ? `<img src="http://localhost:5000${event.image}" class="event-img mb-2" alt="Event Image" />` : ""}
      <h5>${event.name}</h5>
      <p><strong>Date:</strong> ${formatDate(event.date)}</p>
      <p><strong>Location:</strong> ${event.location}</p>
      <p><strong>Participants:</strong> ${event.participants}</p>
      <p><strong>Type:</strong> ${event.type}</p>
      <button class="btn btn-secondary mt-3" id="backToList">Back to Events</button>
    </div>
  `;
  document.getElementById("backToList").onclick = hideEventDetail;
}

// Hide event detail and show event list again
function hideEventDetail() {
  document.getElementById("eventDetail").style.display = "none";
  document.getElementById("eventList").style.display = "flex";
  document.getElementById("eventListTitle").textContent = "Upcoming Events";
}

// Filtering and reset logic (unchanged)
document.getElementById("applyFilters").addEventListener("click", () => {
  const filterName = document.getElementById("filterName").value.toLowerCase();
  const filterLocation = document.getElementById("filterLocation").value.toLowerCase();
  const filterDate = document.getElementById("filterDate").value;
  const filterType = document.getElementById("filterType").value;

  const filteredEvents = eventsData.filter(event => {
    const matchesName = event.name.toLowerCase().includes(filterName);
    const matchesLocation = event.location.toLowerCase().includes(filterLocation);
    const matchesDate = filterDate ? event.date.slice(0, 10) === filterDate : true;
    const matchesType = filterType ? event.type === filterType : true;
    return matchesName && matchesLocation && matchesDate && matchesType;
  });
  displayEvents(filteredEvents);
  displayTrendingEvents(filteredEvents);
});

const resetBtn = document.getElementById("resetFilters");
if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    document.getElementById("filterName").value = '';
    document.getElementById("filterLocation").value = '';
    document.getElementById("filterDate").value = '';
    document.getElementById("filterType").value = '';
    displayEvents(eventsData);
    displayTrendingEvents(eventsData);
  });
}

// --- DARK MODE ---
function setupDarkMode() {
  const toggle = document.getElementById("darkModeToggle");
  const darkClass = "dark-mode";
  // Set initial mode from localStorage
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add(darkClass);
    toggle.checked = true;
  }
  toggle.addEventListener("change", function() {
    if (this.checked) {
      document.body.classList.add(darkClass);
      localStorage.setItem("darkMode", "true");
    } else {
      document.body.classList.remove(darkClass);
      localStorage.setItem("darkMode", "false");
    }
  });
}
