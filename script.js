// GESTION DES ONGLETS
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.add("hidden"));

    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.remove("hidden");
  });
});

// --- CALENDRIER ---
const calendarBody = document.getElementById("calendarBody");
const monthYear = document.getElementById("monthYear");
let currentDate = new Date();
let selectedDate = null;

function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0).getDate();
  const startDay = (firstDay.getDay() + 6) % 7;

  calendarBody.innerHTML = "";
  monthYear.textContent = `${firstDay.toLocaleString("fr-FR", { month: "long" })} ${year}`;

  let row = document.createElement("tr");
  for (let i = 0; i < startDay; i++) {
    row.appendChild(document.createElement("td"));
  }

  for (let day = 1; day <= lastDate; day++) {
    const cell = document.createElement("td");
    const fullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cell.dataset.date = fullDate;
    cell.innerHTML = `${day}<div class="dot-indicator" style="display: none;"></div>`;

    // Indicateur si tâche ou mémo
    const hasTodos = localStorage.getItem(`todos-${fullDate}`);
    const hasMemo = localStorage.getItem(`memo-${fullDate}`);
    if (hasTodos || hasMemo) {
      cell.querySelector('.dot-indicator').style.display = 'block';
    }

    cell.addEventListener("click", () => {
      selectedDate = fullDate;
      showDateTodos(fullDate);
    });

    row.appendChild(cell);

    if ((startDay + day) % 7 === 0 || day === lastDate) {
      calendarBody.appendChild(row);
      row = document.createElement("tr");
    }
  }
}

document.getElementById("prevMonth").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

document.getElementById("nextMonth").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

renderCalendar();

// --- TO-DO PAR DATE ---
const calendrierSection = document.getElementById("calendrier");
const dateTodoContainer = document.createElement("div");
dateTodoContainer.id = "dateTodoContainer";
calendrierSection.appendChild(dateTodoContainer);

function showDateTodos(dateStr) {
  dateTodoContainer.innerHTML = `
    <h3>🗓️ Tâches pour le ${dateStr}</h3>
    <form id="dateTodoForm">
      <input type="text" id="dateTodoInput" placeholder="Nouvelle tâche pour ce jour...">
      <button type="submit">Ajouter</button>
    </form>
    <ul id="dateTodoList"></ul>
  `;

  const form = document.getElementById("dateTodoForm");
  const input = document.getElementById("dateTodoInput");
  const list = document.getElementById("dateTodoList");

  const stored = localStorage.getItem(`todos-${dateStr}`);
  let todos = stored ? JSON.parse(stored) : [];

  function renderList() {
    list.innerHTML = "";
    todos.forEach((todo, i) => {
      const li = document.createElement("li");
      li.textContent = todo;
      const del = document.createElement("button");
      del.textContent = "Supprimer";
      del.addEventListener("click", () => {
        todos.splice(i, 1);
        save();
        renderList();
        renderCalendar();
      });
      li.appendChild(del);
      list.appendChild(li);
    });
  }

  function save() {
    localStorage.setItem(`todos-${dateStr}`, JSON.stringify(todos));
  }

  form.addEventListener("submit", e => {
    e.preventDefault();
    const val = input.value.trim();
    if (val !== "") {
      todos.push(val);
      save();
      renderList();
      input.value = "";
      renderCalendar();
    }
  });

  renderList();
  showDateMemo(dateStr);
}

// --- MÉMO PAR JOUR ---
function showDateMemo(dateStr) {
  const memoKey = `memo-${dateStr}`;
  let currentMemo = localStorage.getItem(memoKey) || "";

  const memoContainer = document.createElement("div");
  memoContainer.innerHTML = `
    <h3>📝 Mémo pour le ${dateStr}</h3>
    <textarea rows="4" style="width: 100%;" id="memo-date-input">${currentMemo}</textarea>
    <button id="saveDateMemo">Enregistrer le mémo</button>
    <p id="memoDateSaved" style="margin-top: 5px;"></p>
  `;

  dateTodoContainer.appendChild(memoContainer);

  const memoInput = memoContainer.querySelector("#memo-date-input");
  const saveBtn = memoContainer.querySelector("#saveDateMemo");
  const status = memoContainer.querySelector("#memoDateSaved");

  saveBtn.addEventListener("click", () => {
    localStorage.setItem(memoKey, memoInput.value);
    status.textContent = "Mémo enregistré ✅";
    renderCalendar();
  });
}

// --- MÉMO GLOBAL ---
const memoInput = document.getElementById("memoInput");
const saveMemo = document.getElementById("saveMemo");
const memoSaved = document.getElementById("memoSaved");

saveMemo.addEventListener("click", () => {
  const text = memoInput.value.trim();
  if (text !== "") {
    localStorage.setItem("memo", text);
    memoSaved.textContent = "Mémo enregistré !";
  }
});

window.addEventListener("load", () => {
  const savedMemo = localStorage.getItem("memo");
  if (savedMemo) {
    memoInput.value = savedMemo;
    memoSaved.textContent = "Mémo chargé.";
  }
});

// --- THÈME SOMBRE / CLAIR ---
const toggleTheme = document.getElementById("toggleTheme");
let darkMode = localStorage.getItem("darkMode") === "true";

function applyTheme() {
  document.body.classList.toggle("dark", darkMode);
  toggleTheme.textContent = darkMode ? "☀️ Mode clair" : "🌙 Mode sombre";
}

toggleTheme.addEventListener("click", () => {
  darkMode = !darkMode;
  localStorage.setItem("darkMode", darkMode);
  applyTheme();
});

applyTheme();
