const STORAGE_KEY = "todoapp-tasks";

const taskForm = document.querySelector("#form-tugas");

if (taskForm) {
  const taskList = document.querySelector("#task-list");
  const emptyState = document.querySelector("#empty-state");
  const filter = document.querySelector("#task-filter");
  const formMessage = document.querySelector("#form-message");
  const totalTasks = document.querySelector("#total-tasks");
  const pendingTasks = document.querySelector("#pending-tasks");
  const completedTasks = document.querySelector("#completed-tasks");
  const dateLabel = document.querySelector("#today-date");

  let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

  dateLabel.textContent = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date());

  function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  function formatDate(date) {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }).format(new Date(`${date}T00:00:00`));
  }

  function renderTasks() {
    taskList.replaceChildren();

    const visibleTasks = tasks.filter((task) => {
      if (filter.value === "pending") return !task.completed;
      if (filter.value === "completed") return task.completed;
      return true;
    });

    visibleTasks.forEach((task) => {
      const item = document.createElement("li");
      item.className = `task-item${task.completed ? " is-complete" : ""}`;

      const checkbox = document.createElement("input");
      checkbox.className = "task-check";
      checkbox.type = "checkbox";
      checkbox.checked = task.completed;
      checkbox.setAttribute("aria-label", `Tandai "${task.title}" selesai`);
      checkbox.addEventListener("change", () => {
        task.completed = checkbox.checked;
        saveTasks();
        renderTasks();
      });

      const details = document.createElement("div");
      details.className = "task-details";
      const title = document.createElement("div");
      title.className = "task-title";
      title.textContent = task.title;

      const meta = document.createElement("div");
      meta.className = "task-meta";
      const priority = document.createElement("span");
      priority.className = `priority${task.priority === "high" ? " priority-high" : task.priority === "low" ? " priority-low" : ""}`;
      priority.textContent = task.priority === "high" ? "Penting" : task.priority === "low" ? "Rendah" : "Normal";
      meta.append(priority);

      if (task.dueDate) {
        const dueDate = document.createElement("span");
        dueDate.className = "task-due";
        dueDate.textContent = `Tenggat ${formatDate(task.dueDate)}`;
        meta.append(dueDate);
      }

      details.append(title, meta);

      const deleteButton = document.createElement("button");
      deleteButton.className = "delete-task";
      deleteButton.type = "button";
      deleteButton.textContent = "Hapus";
      deleteButton.setAttribute("aria-label", `Hapus tugas "${task.title}"`);
      deleteButton.addEventListener("click", () => {
        tasks = tasks.filter((entry) => entry.id !== task.id);
        saveTasks();
        renderTasks();
      });

      item.append(checkbox, details, deleteButton);
      taskList.append(item);
    });

    const completedCount = tasks.filter((task) => task.completed).length;
    totalTasks.textContent = tasks.length;
    pendingTasks.textContent = tasks.length - completedCount;
    completedTasks.textContent = completedCount;
    emptyState.hidden = visibleTasks.length > 0;
  }

  taskForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(taskForm);
    const title = String(formData.get("title")).trim();

    if (!title) {
      formMessage.textContent = "Nama tugas tidak boleh kosong.";
      return;
    }

    tasks.unshift({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title,
      dueDate: String(formData.get("dueDate")),
      priority: String(formData.get("priority")),
      completed: false
    });

    saveTasks();
    taskForm.reset();
    formMessage.textContent = "Tugas berhasil ditambahkan.";
    filter.value = "all";
    renderTasks();
    document.querySelector("#task-title").focus();
  });

  filter.addEventListener("change", renderTasks);
  renderTasks();
}