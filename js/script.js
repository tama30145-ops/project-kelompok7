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
=======
function readTasks() {
	try {
		const tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
		return Array.isArray(tasks) ? tasks : [];
	} catch {
		return [];
	}
}

function saveTasks(tasks) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function formatDate(dateString) {
	if (!dateString) return "";
	return new Intl.DateTimeFormat("id-ID", {
		day: "numeric",
		month: "short",
		year: "numeric"
	}).format(new Date(`${dateString}T00:00:00`));
}

function getLocalDateValue() {
	const today = new Date();
	today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
	return today.toISOString().slice(0, 10);
}

function initializeAddForm() {
	const form = document.querySelector("#task-form");
	if (!form) return;

	const dateInput = form.elements.dueDate;
	dateInput.min = getLocalDateValue();

	form.addEventListener("submit", (event) => {
		event.preventDefault();
		const formData = new FormData(form);
		const title = String(formData.get("title") || "").trim();
		if (!title) return;

		const tasks = readTasks();
		tasks.unshift({
			id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
			title,
			description: String(formData.get("description") || "").trim(),
			dueDate: String(formData.get("dueDate") || ""),
			priority: String(formData.get("priority") || "normal"),
			completed: false,
			createdAt: new Date().toISOString()
		});

		saveTasks(tasks);
		form.reset();
		dateInput.min = getLocalDateValue();
		document.querySelector("#form-message").textContent = "Task tersimpan. Tambahkan task berikutnya atau lihat daftar task.";
	});
}

function initializeTaskList() {
	const list = document.querySelector("#task-list");
	if (!list) return;

	const searchInput = document.querySelector("#task-search");
	const filterButtons = [...document.querySelectorAll("[data-filter]")];
	const emptyState = document.querySelector("#empty-state");
	let activeFilter = "all";

	function renderTasks() {
		const tasks = readTasks();
		const query = searchInput.value.trim().toLocaleLowerCase("id-ID");
		const visibleTasks = tasks.filter((task) => {
			const matchesFilter = activeFilter === "all"
				|| (activeFilter === "completed" ? task.completed : !task.completed);
			const matchesQuery = `${task.title} ${task.description}`.toLocaleLowerCase("id-ID").includes(query);
			return matchesFilter && matchesQuery;
		});

		list.replaceChildren();
		visibleTasks.forEach((task) => {
			const card = document.createElement("article");
			card.className = `task-card${task.completed ? " is-completed" : ""}`;

			const main = document.createElement("div");
			main.className = "task-card-main";
			const checkbox = document.createElement("input");
			checkbox.className = "task-check";
			checkbox.type = "checkbox";
			checkbox.checked = Boolean(task.completed);
			checkbox.setAttribute("aria-label", `Tandai ${task.title} sebagai ${task.completed ? "belum selesai" : "selesai"}`);
			checkbox.addEventListener("change", () => {
				saveTasks(readTasks().map((item) => item.id === task.id ? { ...item, completed: checkbox.checked } : item));
				renderTasks();
			});

			const content = document.createElement("div");
			content.className = "task-content";
			const title = document.createElement("h2");
			title.className = "task-title";
			title.textContent = task.title;
			content.append(title);

			if (task.description) {
				const description = document.createElement("p");
				description.className = "task-description";
				description.textContent = task.description;
				content.append(description);
			}

			const meta = document.createElement("div");
			meta.className = "task-meta";
			const priorityLabels = { high: "Prioritas tinggi", normal: "Prioritas normal", low: "Prioritas rendah" };
			const priority = document.createElement("span");
			priority.className = `task-tag priority-${task.priority || "normal"}`;
			priority.textContent = priorityLabels[task.priority] || priorityLabels.normal;
			meta.append(priority);
			if (task.dueDate) {
				const dueDate = document.createElement("span");
				dueDate.className = "task-tag";
				dueDate.textContent = `Tenggat ${formatDate(task.dueDate)}`;
				meta.append(dueDate);
			}
			content.append(meta);
			main.append(checkbox, content);

			const actions = document.createElement("div");
			actions.className = "task-card-actions";
			const deleteButton = document.createElement("button");
			deleteButton.className = "icon-button";
			deleteButton.type = "button";
			deleteButton.textContent = "Hapus";
			deleteButton.setAttribute("aria-label", `Hapus ${task.title}`);
			deleteButton.addEventListener("click", () => {
				saveTasks(readTasks().filter((item) => item.id !== task.id));
				renderTasks();
			});
			actions.append(deleteButton);
			card.append(main, actions);
			list.append(card);
		});

		const completedCount = tasks.filter((task) => task.completed).length;
		document.querySelector("#task-count").textContent = `${tasks.length} task`;
		document.querySelector("#task-progress").textContent = `${completedCount} selesai`;
		emptyState.hidden = visibleTasks.length > 0;
		document.querySelector("#empty-title").textContent = tasks.length === 0 ? "Belum ada task" : "Task tidak ditemukan";
		document.querySelector("#empty-description").textContent = tasks.length === 0
			? "Tambahkan task pertama untuk mulai mengatur harimu."
			: "Coba ubah kata kunci atau filter yang dipilih.";
		emptyState.querySelector("a").hidden = tasks.length > 0;
	}

	filterButtons.forEach((button) => {
		button.addEventListener("click", () => {
			activeFilter = button.dataset.filter;
			filterButtons.forEach((item) => {
				const isActive = item === button;
				item.classList.toggle("active", isActive);
				item.setAttribute("aria-pressed", String(isActive));
			});
			renderTasks();
		});
	});
	searchInput.addEventListener("input", renderTasks);
	renderTasks();
}

initializeAddForm();
initializeTaskList();
