let tasks = JSON.parse(localStorage.getItem("daylist-tasks")) || [
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

let currentFilter = "all";

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

const POINTS = {
low: 5,
medium: 10,
high: 15
};

function saveTasks() {
localStorage.setItem("daylist-tasks", JSON.stringify(tasks));
}

function setDate() {
const date = new Date();

currentDate.textContent = date
.toLocaleDateString("en-US", {
weekday: "long",
month: "long",
day: "numeric"
})
.toUpperCase();
}

function renderTasks() {
taskList.innerHTML = "";

const filteredTasks = tasks.filter((task) => {
if (currentFilter === "active") return !task.completed;
if (currentFilter === "completed") return task.completed;

```
return true;
```

});

filteredTasks.forEach((task) => {
const taskElement = document.createElement("article");


taskElement.className = `task${task.completed ? " completed" : ""}`;

taskElement.innerHTML = `
  <button
    class="checkbox${task.completed ? " checked" : ""}"
    aria-label="Complete task"
    data-id="${task.id}"
  >
    ${task.completed ? "✓" : ""}
  </button>

  <div class="task-content">
    <div class="task-title">
      ${escapeHTML(task.title)}
    </div>

    <div class="task-meta">
      <span class="priority ${task.priority}">
        ${task.priority.toUpperCase()}
      </span>

      <span>
        ${task.completed ? "Completed" : "In progress"}
      </span>
    </div>
  </div>

  <button
    class="delete"
    aria-label="Delete task"
    data-id="${task.id}"
  >
    ×
  </button>
`;

taskList.appendChild(taskElement);


});

updateEmptyState();
updateStats();
}

function updateEmptyState() {
emptyState.classList.toggle(
"visible",
taskList.children.length === 0
);
}

function addTask(event) {
event.preventDefault();

const title = taskInput.value.trim();

if (!title) {
taskInput.focus();
return;
}

tasks.unshift({
id: Date.now(),
title,
priority: priorityInput.value,
completed: false
});

saveTasks();
renderTasks();

taskInput.value = "";
taskInput.focus();
}

function toggleTask(id) {
const task = tasks.find((task) => task.id === id);

if (!task) return;

task.completed = !task.completed;

saveTasks();
renderTasks();
}

function deleteTask(id) {
tasks = tasks.filter((task) => task.id !== id);

saveTasks();
renderTasks();
}

function updateStats() {
const total = tasks.length;

const completed = tasks.filter(
(task) => task.completed
).length;

const remaining = total - completed;

const percentage = total === 0
? 0
: Math.round((completed / total) * 100);

const totalPoints = tasks.reduce((sum, task) => {
if (!task.completed) return sum;

```
return sum + POINTS[task.priority];
```

}, 0);

totalTasks.textContent = total;
completedTasks.textContent = completed;
remainingTasks.textContent = remaining;
points.textContent = totalPoints;

progressPercent.textContent = `${percentage}%`;

taskCount.textContent = `${total} ${
    total === 1 ? "task" : "tasks"
  }`;

updateProgressCircle(percentage);
updateMotivation(percentage);
updateStreak(completed);
}

function updateProgressCircle(percentage) {
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

```
return;
```

}

if (percentage === 0) {
progressTitle.textContent = "Ready when you are.";
progressMessage.textContent =
"Start with one task. Momentum comes after.";

```
return;
```

}

if (percentage < 50) {
progressTitle.textContent = "You're getting there.";
progressMessage.textContent =
"Keep going. One completed task at a time.";

```
return;
```

}

if (percentage < 100) {
progressTitle.textContent = "Almost there.";
progressMessage.textContent =
"You've done the hard part. Finish strong.";

```
return;
```

}

progressTitle.textContent = "Day complete.";
progressMessage.textContent =
"Everything is done. Nice work.";
}

function updateStreak(completed) {
streakElement.textContent =
completed > 0 ? "7 days" : "0 days";
}

function escapeHTML(text) {
const element = document.createElement("div");

element.textContent = text;

return element.innerHTML;
}

taskForm.addEventListener("submit", addTask);

taskList.addEventListener("click", (event) => {
const checkbox = event.target.closest(".checkbox");
const deleteButton = event.target.closest(".delete");

if (checkbox) {
toggleTask(Number(checkbox.dataset.id));
return;
}

if (deleteButton) {
deleteTask(Number(deleteButton.dataset.id));
}
});

document.querySelectorAll(".filter").forEach((button) => {
button.addEventListener("click", () => {
document.querySelectorAll(".filter").forEach((filter) => {
filter.classList.remove("active");
});

```
button.classList.add("active");

currentFilter = button.dataset.filter;

renderTasks();
```

});
});

setDate();
renderTasks();
