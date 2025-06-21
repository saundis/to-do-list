import './style.css';
import { projectManager, changeCurrentProjectPage, getCurrentProjectPage } from './project-manager.js';
import pencil from '../images/pencil.svg';
const requirePounds = require.context('../images/pounds', false, /\.svg$/);
const poundImages = requirePounds.keys().map(requirePounds);
const body = document.querySelector('body');
const main = document.querySelector('.main');

const title = main.querySelector('.header h1');
const goBackButton = main.querySelector('#back');

const addTaskPrompt = main.querySelector('#task');
const taskDialogue = document.querySelector('.add-task');
const taskDialogueTitle = document.querySelector('.add-task h1');
const taskNameInput = document.querySelector('#title');
const taskDescriptionInput = document.querySelector('#description');
const taskDateInput = document.querySelector('#date');
const taskTimeInput = document.querySelector('#time');
const taskPriorityInput = document.querySelector('#priority');
const cancelTaskButton = document.querySelector('.add-task .cancel');
const addTaskButton = document.querySelector('.add-task .add');

const taskContainer = document.querySelector('.task-container');
const sidebarList = document.querySelector('.sidebar ul');

const colors = ['red', 'green', 'pink', 'blue', 'orange'];

function loadProjectPage() {
  // REQUIRED TO ENSURE PROJECTS ONLY LOADED ONCE
  if (!body.classList.contains('projects-page')) {
    return;
  }
  const allProjects = projectManager.loadProjects()

  // LOADS SIDEBAR
  for (let project of allProjects) {
    makeSidebarCard({ key: project.key, projectName: project.projectName, color: project.color })
  }

  let currentProject = projectManager.getProject(getCurrentProjectPage())[0];

  if (!currentProject) {
    return;
  }

  title.textContent = currentProject.projectName;
  taskContainer.innerHTML = '';
  loadTasks(currentProject)
}

function giveTaskInfo() {
  if (!taskNameInput.value || !taskDateInput.value || !taskTimeInput.value) {
    return;
  }

  const task = projectManager.getTask(addTaskButton.dataset.currentTask);
  const taskInformation = {
    name: taskNameInput.value,
    description: taskDescriptionInput.value,
    date: taskDateInput.value,
    time: taskTimeInput.value,
    priority: taskPriorityInput.value,
  }

  if (task && addTaskButton.textContent === 'Edit') {
    // Edit existing task
    editTask(addTaskButton.dataset.currentTask, taskInformation);
  }
  else {
    // Create new task
    // Send it over to be parsed into useful information and sent back
    let information = projectManager.addTask(taskInformation);
    
    // information now holds all the information but better formatted for DOM
    // there's also a dataKey which is the difference in calendar days which is used for sorting
    makeTask(information);
  }
}

function makeTask(information) {
  const dayContainer = getDayContainer(information.dateKey, information.date);

  const listElement = document.createElement('li');
  listElement.dataset.timeKey = information.timeKey; // for sorting
  listElement.dataset.taskKey = information.key;

  const taskDiv = document.createElement('div');
  taskDiv.classList.add('task');
  taskDiv.addEventListener('click', taskClicked);

  const topDiv = document.createElement('div');
  topDiv.classList.add('top');

  const completedButton = document.createElement('button');
  completedButton.classList.add('completed');

  const titleDiv = document.createElement('div');
  titleDiv.classList.add('title');
  titleDiv.textContent = information.name;

  const editButton = document.createElement('button');
  editButton.classList.add('edit-button');
  const editImage = document.createElement('img');
  editImage.src = pencil;
  editImage.alt = 'Edit task';
  editButton.append(editImage);

  const descriptionDiv = document.createElement('div');
  descriptionDiv.classList.add('description');
  descriptionDiv.textContent = information.description;

  const timeDiv = document.createElement('div');
  timeDiv.classList.add('time');
  timeDiv.classList.add(information.priority.toLowerCase());
  timeDiv.textContent = information.time;

  topDiv.append(completedButton);
  topDiv.append(titleDiv);
  topDiv.append(editButton);
  taskDiv.append(topDiv);
  taskDiv.append(descriptionDiv);
  taskDiv.append(timeDiv);
  listElement.append(taskDiv);

  // Sorting
  setSortedTaskPosition(dayContainer.querySelector('ul'), listElement);
}

function editTask(taskKey, newInformation) {
  newInformation = projectManager.editTask(taskKey, newInformation);
  let listElement;

  // Get list element
  for (let task of taskContainer.querySelectorAll('li')) {
    if (task.dataset.taskKey === taskKey) {
      listElement = task;
      break;
    }
  }

  if (!listElement) {
    return;
  }

  finishedTask(listElement, false);
  makeTask(newInformation);
}

function getDayContainer(dateKey, date) {
  // iterate through html and see if exist
  let beforeElement = null;

  // iterate through html and see if exist
  // if not, save the date of the one right before
  for (const container of taskContainer.children) {
    if (parseInt(container.dataset.dateKey) === dateKey) {
      return container;
    } else if (parseInt(container.dataset.dateKey) > dateKey) {
      break;
    }
    beforeElement = container;
  }

  // set it up if it doesn't exist
  const newContainer = document.createElement('div')
  newContainer.classList.add('day');
  newContainer.dataset.dateKey = dateKey;

  const header = document.createElement('h2');
  header.classList.add('header');
  header.textContent = date;

  const list = document.createElement('ul');

  newContainer.append(header);
  newContainer.append(list);
  if (!beforeElement) {
    taskContainer.prepend(newContainer);
  } else {
    beforeElement.after(newContainer);
  }
  return newContainer;
}

function setSortedTaskPosition(list, listElement) {
  let beforeElement = null;

  for (const container of list.children) {
    if (parseInt(container.dataset.timeKey) >= parseInt(listElement.dataset.timeKey)) {
      break;
    }
    beforeElement = container;
  }

  if (!beforeElement) {
    list.prepend(listElement);
  } else {
    beforeElement.after(listElement)
  }
}

function loadTasks(project) {
  project = structuredClone(project);
  for (let task of project.tasks) {
    makeTask(projectManager.parseTask(task));
  }
}

function finishedTask(listElement, actualRemove) {
  // actualRemove to see if you actually want to remove the item from data
  if (actualRemove) {
    projectManager.removeTask(listElement.dataset.taskKey);
  }

  listElement.firstChild.removeEventListener('click', taskClicked);
  const container = listElement.closest('.day');
  const taskList = listElement.closest('ul');
  listElement.remove();

  if (taskList.children.length === 0) {
    container.remove();
  }
}

function taskClicked(event) {
  const target = event.target;

  if (target.classList.contains('completed')) {
    finishedTask(target.closest('li'), true);
  } else if (target.closest('.edit-button')) {
    promptEditTask(target.closest('li'));
  }
}

function promptEditTask(taskElement) {
  const taskInformation = projectManager.getTask(taskElement.dataset.taskKey);

  if (!taskInformation) {
    return;
  }

  addTaskButton.dataset.currentTask = taskInformation.key;
  taskDialogueTitle.textContent = 'Edit Task';
  addTaskButton.style.backgroundColor = 'rgb(108, 214, 98)';
  addTaskButton.textContent = 'Edit';
  taskNameInput.value = taskInformation.name;
  taskDescriptionInput.value = taskInformation.description;
  taskDateInput.value = taskInformation.date;
  taskTimeInput.value = taskInformation.time;
  taskPriorityInput.value = taskInformation.priority;

  taskDialogue.showModal()
}

function makeSidebarCard(information) {
  const listElement = document.createElement('li');
  listElement.dataset.key = information.key

  const newButton = document.createElement('button');
  newButton.classList.add('project');

  const hashTag = document.createElement('img');
  hashTag.src = poundImages[colors.indexOf(information.color)];

  const title = document.createElement('div');
  title.textContent = information.projectName

  newButton.append(hashTag);
  newButton.append(title);
  listElement.append(newButton);
  sidebarList.append(listElement);

  newButton.addEventListener('click', () => {
    openProjectPage(information.key);
  })
}

function openProjectPage(key) {
  changeCurrentProjectPage(key);
  window.location.href = './projects.html';
}

function goBack() {
  window.location.href = './index.html';
}

function showTaskDialogue() {
  taskDialogueTitle.textContent = 'Add Task';
  addTaskButton.style.backgroundColor = 'rgb(244, 83, 83)';
  addTaskButton.textContent = 'Add';
  taskNameInput.value = '';
  taskDescriptionInput.value = '';
  taskDateInput.value = '';
  taskTimeInput.value = '';
  taskPriorityInput.value = 'low';
  taskDialogue.showModal()
}

function closeTaskDialogue() {
  taskDialogue.close()
}

function addListener(element, event, func) {
  if (element) {
    element.addEventListener(event, func)
  }
}

addListener(goBackButton, 'click', goBack);
addListener(document, 'DOMContentLoaded', loadProjectPage);
addListener(addTaskPrompt, 'click', showTaskDialogue);
addListener(cancelTaskButton, 'click', closeTaskDialogue);
addListener(addTaskButton, 'click', giveTaskInfo);

window.addEventListener('load', () => {
  document.body.style.visibility = 'visible';
});

export { openProjectPage }