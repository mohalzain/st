let tasks =  [];

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
fetch('/render-tasks',{method:'GET'})
.then(data=>{
  return data.json()
})
.then(data=>{
tasks = data
const filteredTasks = tasks.filter((task) => {
if (currentFilter == "active") return !task.completed;
if (currentFilter == "completed") return task.completed;
return true;
});

filteredTasks.forEach((task) => {
const taskElement = document.createElement("article");
taskElement.className = `task${task.completed ? " completed" : ""}`;

taskElement.innerHTML = `
  <button
    class="checkbox${task.completed ? " checked" : ""}"
    aria-label="Complete task"
    data-id="${task.title}"
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
    data-id="${task.title}"
  >
    ×
  </button>
`;
taskList.appendChild(taskElement);
})
});

updateEmptyState();
updateStats();
console.log(tasks)
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
const taska = {
id: Date.now(),
title,
priority: priorityInput.value,
completed: false
}

const packet = JSON.stringify(taska)

fetch('/add-task',{method:'POST',headers:{ 'Content-Type': 'application/json'},body:packet})
.then(ok=>{
  return ok.json()
})
.then(ok=>{
  console.log(ok)
  tasks.unshift({
  id: Date.now(),
  title,
  priority: priorityInput.value,
  completed: false
  });
  renderTasks();
})
.catch(err=>{
  console.log(err)
})


taskInput.value = "";
taskInput.focus();
}

function toggleTask(title) {
  
const task = tasks.find((task) => task.title === title);

if (!task) return;
task.completed = !task.completed;
const packet = JSON.stringify({title:task.title,completed:task.completed})
fetch('/completed-task',{method:"POST",headers:{'Content-Type': 'application/json'},body:packet})
.then(data=>{
  return data.json()
})
.then(data=>{
  console.log(data);
  renderTasks();
})

}

function deleteTask(title) {
task = tasks.filter((tas)=> tas.title == title)
tasks = tasks.filter((task) => task.title !== title);

const packet = JSON.stringify({title:task[0].title})

fetch('/delete-task',{method:"POST",headers:{'Content-Type': 'application/json'},body:packet})
.then(data=>{
  return data.json()
})
.then(data=>{
  console.log(data);
 
})
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

return sum + POINTS[task.priority];

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


return;


}

if (percentage === 0) {
progressTitle.textContent = "Ready when you are.";
progressMessage.textContent =
"Start with one task. Momentum comes after.";


return;


}

if (percentage < 50) {
progressTitle.textContent = "You're getting there.";
progressMessage.textContent =
"Keep going. One completed task at a time.";


return;


}

if (percentage < 100) {
progressTitle.textContent = "Almost there.";
progressMessage.textContent =
"You've done the hard part. Finish strong.";


return;


}

progressTitle.textContent = "Day complete.";
progressMessage.textContent =
"Everything is done. Nice work.";
}

function updateStreak(completed) {
streakElement.textContent =
completed > 0 ? "1 days" : "0 days";
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
  //console.log(event.target.dataset.id)
toggleTask(event.target.dataset.id);
return;
}

if (deleteButton) {
  //console.log(event.target.dataset.id)
deleteTask(event.target.dataset.id);
}
});

document.querySelectorAll(".filter").forEach((button) => {
button.addEventListener("click", () => {
document.querySelectorAll(".filter").forEach((filter) => {
filter.classList.remove("active");
});


button.classList.add("active");

currentFilter = button.dataset.filter;

renderTasks();


});
});

setDate();
renderTasks();
