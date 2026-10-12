const STORAGE_KEY = "todoapp-tasks";

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
