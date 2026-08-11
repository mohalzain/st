document.addEventListener("DOMContentLoaded", function () {
  const taskForm = document.getElementById("taskForm");
  const taskInput = document.getElementById("taskInput");
  const priorityInput = document.getElementById("priorityInput");
  const taskList = document.getElementById("taskList");
  const emptyState = document.getElementById("emptyState");

  const totalTasks = document.getElementById("totalTasks");
  const completedTasks = document.getElementById("completedTasks");
  const remainingTasks = document.getElementById("remainingTasks");
  const points = document.getElementById("points");
  const taskCount = document.getElementById("taskCount");

  const progressPercent = document.getElementById("progressPercent");
  const progressBar = document.getElementById("progressBar");
  const progressTitle = document.getElementById("progressTitle");
  const progressMessage = document.getElementById("progressMessage");

  const streakElement = document.getElementById("streak");
  const currentDate = document.getElementById("currentDate");

  const pointValues = {
    low: 5,
    medium: 10,
    high: 15
  };

  const defaultTasks = [
    {
      id: 1,
      title: "Plan today's priorities",
      priority: "high",
      completed: true
    },
    {
      id: 2,
      title: "Work on the main project",
      priority: "high",
      completed: false
    },
    {
      id: 3,
      title: "Read for 20 minutes",
      priority: "low",
      completed: false
    },
    {
      id: 4,
      title: "Go for a short walk",
      priority: "medium",
      completed: false
    }
  ];

  let tasks = [];
  let currentFilter = "all";

  function loadTasks() {
    const savedTasks = localStorage.getItem("daylist-tasks");

    if (!savedTasks) {
      tasks = defaultTasks;
      return;
    }

    try {
      const parsedTasks = JSON.parse(savedTasks);

      if (Array.isArray(parsedTasks)) {
        tasks = parsedTasks;
      } else {
        tasks = defaultTasks;
      }
    } catch (error) {
      tasks = defaultTasks;
    }
  }

  function saveTasks() {
    localStorage.setItem(
      "daylist-tasks",
      JSON.stringify(tasks)
    );
  }

  function setDate() {
    const today = new Date();

    currentDate.textContent = today
      .toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric"
      })
      .toUpperCase();
  }

  function createTask(task) {
    const taskElement = document.createElement("article");

    taskElement.className = "task";

    if (task.completed) {
      taskElement.classList.add("completed");
    }

    const checkbox = document.createElement("button");

    checkbox.type = "button";
    checkbox.className = "checkbox";
    checkbox.dataset.id = task.id;
    checkbox.setAttribute(
      "aria-label",
      "Complete task"
    );

    if (task.completed) {
      checkbox.classList.add("checked");
      checkbox.textContent = "✓";
    }

    const content = document.createElement("div");

    content.className = "task-content";

    const title = document.createElement("div");

    title.className = "task-title";
    title.textContent = task.title;

    const meta = document.createElement("div");

    meta.className = "task-meta";

    const priority = document.createElement("span");

    priority.className = "priority " + task.priority;
    priority.textContent = task.priority.toUpperCase();

    const status = document.createElement("span");

    status.textContent = task.completed
      ? "Completed"
      : "In progress";

    meta.appendChild(priority);
    meta.appendChild(status);

    content.appendChild(title);
    content.appendChild(meta);

    const deleteButton = document.createElement("button");

    deleteButton.type = "button";
    deleteButton.className = "delete";
    deleteButton.dataset.id = task.id;
    deleteButton.textContent = "×";
    deleteButton.setAttribute(
      "aria-label",
      "Delete task"
    );

    taskElement.appendChild(checkbox);
    taskElement.appendChild(content);
    taskElement.appendChild(deleteButton);

    return taskElement;
  }

  function renderTasks() {
    taskList.innerHTML = "";

    const visibleTasks = tasks.filter(function (task) {
      if (currentFilter === "active") {
        return !task.completed;
      }

      if (currentFilter === "completed") {
        return task.completed;
      }

      return true;
    });

    visibleTasks.forEach(function (task) {
      taskList.appendChild(createTask(task));
    });

    emptyState.classList.toggle(
      "visible",
      visibleTasks.length === 0
    );

    updateStats();
  }

  function addTask(event) {
    event.preventDefault();

    const title = taskInput.value.trim();

    if (title === "") {
      taskInput.focus();
      return;
    }

    const newTask = {
      id: Date.now(),
      title: title,
      priority: priorityInput.value,
      completed: false
    };

    tasks.unshift(newTask);

    saveTasks();
    renderTasks();

    taskInput.value = "";
    priorityInput.value = "medium";

    taskInput.focus();
  }

  function toggleTask(id) {
    const task = tasks.find(function (item) {
      return item.id === id;
    });

    if (!task) {
      return;
    }

    task.completed = !task.completed;

    saveTasks();
    renderTasks();
  }

  function deleteTask(id) {
    tasks = tasks.filter(function (task) {
      return task.id !== id;
    });

    saveTasks();
    renderTasks();
  }

  function updateStats() {
    const total = tasks.length;

    const completed = tasks.filter(function (task) {
      return task.completed;
    }).length;

    const remaining = total - completed;

    let earnedPoints = 0;

    tasks.forEach(function (task) {
      if (task.completed) {
        earnedPoints += pointValues[task.priority] || 0;
      }
    });

    let percentage = 0;

    if (total > 0) {
      percentage = Math.round(
        (completed / total) * 100
      );
    }

    totalTasks.textContent = total;
    completedTasks.textContent = completed;
    remainingTasks.textContent = remaining;
    points.textContent = earnedPoints;

    taskCount.textContent =
      total + " " + (total === 1 ? "task" : "tasks");

    progressPercent.textContent =
      percentage + "%";

    updateProgress(percentage);
    updateMotivation(percentage);

    streakElement.textContent =
      completed > 0 ? "7 days" : "0 days";
  }

  function updateProgress(percentage) {
    const circumference = 264;

    const offset =
      circumference -
      (percentage / 100) * circumference;

    progressBar.style.strokeDashoffset = offset;
  }

  function updateMotivation(percentage) {
    if (tasks.length === 0) {
      progressTitle.textContent = "Start small.";

      progressMessage.textContent =
        "Add your first task and make today count.";

      return;
    }

    if (percentage === 0) {
      progressTitle.textContent =
        "Ready when you are.";

      progressMessage.textContent =
        "Start with one task. Momentum comes after.";

      return;
    }

    if (percentage < 50) {
      progressTitle.textContent =
        "You're getting there.";

      progressMessage.textContent =
        "Keep going. One completed task at a time.";

      return;
    }

    if (percentage < 100) {
      progressTitle.textContent =
        "Almost there.";

      progressMessage.textContent =
        "You've done the hard part. Finish strong.";

      return;
    }

    progressTitle.textContent =
      "Day complete.";

    progressMessage.textContent =
      "Everything is done. Nice work.";
  }

  taskForm.addEventListener(
    "submit",
    addTask
  );

  taskList.addEventListener(
    "click",
    function (event) {
      const checkbox =
        event.target.closest(".checkbox");

      const deleteButton =
        event.target.closest(".delete");

      if (checkbox) {
        toggleTask(
          Number(checkbox.dataset.id)
        );

        return;
      }

      if (deleteButton) {
        deleteTask(
          Number(deleteButton.dataset.id)
        );
      }
    }
  );

  const filterButtons =
    document.querySelectorAll(".filter");

  filterButtons.forEach(function (button) {
    button.addEventListener(
      "click",
      function () {
        filterButtons.forEach(function (filter) {
          filter.classList.remove("active");
        });

        button.classList.add("active");

        currentFilter =
          button.dataset.filter;

        renderTasks();
      }
    );
  });

  loadTasks();
  setDate();
  renderTasks();
});