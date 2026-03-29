(() => {
  const STORAGE_KEY = 'todo_tasks';

  // --- State ---
  let tasks = load();
  let filter = 'all';

  // --- DOM refs ---
  const input       = document.getElementById('taskInput');
  const addBtn      = document.getElementById('addBtn');
  const taskList    = document.getElementById('taskList');
  const emptyState  = document.getElementById('emptyState');
  const summary     = document.getElementById('summary');
  const remainCount = document.getElementById('remainCount');
  const clearDoneBtn = document.getElementById('clearDoneBtn');
  const filterBtns  = document.querySelectorAll('.filter-btn');

  // --- Init ---
  render();

  // --- Event listeners ---
  addBtn.addEventListener('click', addTask);

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTask();
  });

  clearDoneBtn.addEventListener('click', () => {
    tasks = tasks.filter(t => !t.done);
    save();
    render();
  });

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filter = btn.dataset.filter;
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      render();
    });
  });

  // --- Core functions ---
  function addTask() {
    const text = input.value.trim();
    if (!text) return;

    tasks.unshift({ id: Date.now(), text, done: false });
    input.value = '';
    save();
    render();
  }

  function toggleTask(id) {
    tasks = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
    save();
    render();
  }

  function deleteTask(id) {
    const el = taskList.querySelector(`[data-id="${id}"]`);
    if (el) {
      el.style.animation = 'slideOut 0.18s ease forwards';
      el.addEventListener('animationend', () => {
        tasks = tasks.filter(t => t.id !== id);
        save();
        render();
      }, { once: true });
    }
  }

  function render() {
    const filtered = tasks.filter(t => {
      if (filter === 'active')    return !t.done;
      if (filter === 'completed') return t.done;
      return true;
    });

    taskList.innerHTML = '';

    filtered.forEach(task => {
      const li = document.createElement('li');
      li.className = `task-item${task.done ? ' done' : ''}`;
      li.dataset.id = task.id;

      li.innerHTML = `
        <button class="checkbox${task.done ? ' checked' : ''}" aria-label="Toggle task"></button>
        <span class="task-text">${escapeHtml(task.text)}</span>
        <button class="delete-btn" aria-label="Delete task">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
        </button>
      `;

      li.querySelector('.checkbox').addEventListener('click', () => toggleTask(task.id));
      li.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));

      taskList.appendChild(li);
    });

    // Empty state
    emptyState.classList.toggle('visible', filtered.length === 0);

    // Summary
    const total   = tasks.length;
    const remain  = tasks.filter(t => !t.done).length;
    summary.textContent = `${total} task${total !== 1 ? 's' : ''}`;
    remainCount.textContent = `${remain} remaining`;
  }

  // --- Persistence ---
  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  // --- Util ---
  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Slide-out animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideOut {
      to { opacity: 0; transform: translateX(12px); max-height: 0; margin: 0; padding: 0; }
    }
  `;
  document.head.appendChild(style);
})();
