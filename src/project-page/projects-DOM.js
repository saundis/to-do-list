import '../style.css';
import { projectManager, changeCurrentProjectPage, getCurrentProjectPage } from '../project-manager.js';
import pencil from '../../images/pencil.svg';
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

function loadProjectPage() {
  // REQUIRED TO ENSURE PROJECTS ONLY LOADED ONCE
  if (!body.classList.contains('projects-page')) {
    return;
  }
  projectManager.loadProjects()

  let currentProject = projectManager.getProject(getCurrentProjectPage())[0];

  if (!currentProject) {
    return;
  }

  title.textContent = currentProject.projectName;
  taskContainer.innerHTML = '';
  loadTasks(currentProject)
}

function giveTaskInfo() {
  // Send it over to be parsed into useful information and sent back
  let information = projectManager.addTask({
    name: taskNameInput.value,
    description: taskDescriptionInput.value,
    date: taskDateInput.value,
    time: taskTimeInput.value,
    priority: taskPriorityInput.value,
  });
  
  // information now holds all the information but better formatted for DOM
  // there's also a dataKey which is the difference in calendar days which is used for sorting
  makeTask(information);
}

function makeTask(information) {
  const dayContainer = getDayContainer(information.dateKey, information.date);

  const listElement = document.createElement('li');

  const taskDiv = document.createElement('div');
  taskDiv.classList.add('task');

  const topDiv = document.createElement('div');
  topDiv.classList.add('top');

  const completedButton = document.createElement('button');
  completedButton.classList.add('completed');

  const titleDiv = document.createElement('div');
  titleDiv.classList.add('title');
  titleDiv.textContent = information.name;

  const editButton = document.createElement('button');
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

  // ***** THIS GOTTA BE SORTED *****
  dayContainer.querySelector('ul').append(listElement);
}

function getDayContainer(dateKey, date) {
  // iterate through html and see if exist
  let beforeElement = null;

  // iterate through html and see if exist
  // if not, save the date of the one right before
  for (const container of taskContainer.children) {
    if (parseInt(container.dataset.dateKey) === dateKey) {
      return container;
    } else if (container.dataset.dateKey > dateKey) {
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

function loadTasks() {
  // do something
}

function openProjectPage(key) {
 changeCurrentProjectPage(key);
  window.location.href = '../project-page/projects.html';
}

function goBack() {
  window.location.href = '../index.html';
}

function showTaskDialogue() {
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