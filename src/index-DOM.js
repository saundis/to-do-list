import './style.css';
import { projectManager } from './project-manager.js';
import { openProjectPage } from './projects-DOM.js'
import trashIcon from '../images/trash.svg';
const requirePounds = require.context('../images/pounds', false, /\.svg$/);
const poundImages = requirePounds.keys().map(requirePounds);
const body = document.querySelector('body');

const projectDialogue = document.querySelector('.add-project');
const projectNameInput = document.querySelector('#title');
const cancelProjectButton = document.querySelector('.cancel');
const addProjectButton = document.querySelector('.add');

const trashDialogue = document.querySelector('.trash-dialogue');
const cancelTrashButton= document.querySelector('.no');
const yesTrashButton = document.querySelector('.yes');
// trashItem will be a reference to the card that might being deleted
let trashItem;

const sidebarList = document.querySelector('.sidebar ul');

const addProjectPrompt = document.querySelector('#project');
const container = document.querySelector('.main .container');

const colors = ['red', 'green', 'pink', 'blue', 'orange'];
let colorNumber = 0;

function giveProjectInfo() {
  let projectName = projectNameInput.value;
  let color = getColor();
  if (projectName === '') {
    return;
  }

  let key = projectManager.addProject(projectName, color);
  if (!key) {
    return;
  }

  makeProjectCard({ key, projectName, color });
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

function makeProjectCard(information) {
  const card = document.createElement('div');
  card.classList.add('card');
  card.dataset.key = information.key
  card.addEventListener('click', cardClicked);
  card.classList.add(information.color);
  makeSidebarCard(information);

  const cardInside = document.createElement('div');
  cardInside.classList.add('inside');

  const title = document.createElement('h2');
  title.textContent = information.projectName;

  const list = document.createElement('ul');
  // If making project, information.tasks won't exist. If it's loading in, it will.
  if (information.tasks) {
    // 3 is the max amount of tasks that will show on a card
    for (let i = 0; i < 3; i++) {
      if (i >= information.tasks.length) {
        break;
      }
      const newListElement = document.createElement('li');
      
      const newTask = document.createElement('div');
      newTask.classList.add('task')
      newTask.textContent = (information.tasks)[i].name;

      newListElement.append(newTask);
      list.append(newListElement);
    }
  }

  const trashImage = document.createElement('img');
  trashImage.classList.add('trash');
  trashImage.src = trashIcon;
  trashImage.alt = 'Trash project';

  cardInside.append(title);
  cardInside.append(list);
  cardInside.append(trashImage);
  card.append(cardInside);
  container.append(card);
}

function loadProjectCards() {
  if (!body.classList.contains('home-page')) {
    return;
  }
  const allProjects = projectManager.loadProjects()

  for (let project of allProjects) {
    getColor() // Moves the color so it doesn't start on red every single time
    makeProjectCard({ key: project.key, projectName: project.projectName, color: project.color, tasks: project.tasks })
  }
}

function cardClicked(event) {
  const element = event.target;
  if (element.classList.contains('trash')) {
    showTrashDialogue(element)
  }
  else {
    const card = element.closest('.card');
    openProjectPage(card.dataset.key)
  }
}

function trashProject() {
  trashItem.removeEventListener('click', cardClicked);
  projectManager.trashProject(trashItem.dataset.key)
  
  let key = trashItem.dataset.key
  for (let child of sidebarList.children) {
    if (child.dataset.key === key) {
      child.remove()
      break;
    }
  }
  trashItem.remove()

  trashDialogue.close()
}

function showTrashDialogue(trashIcon) {
  trashItem = trashIcon.parentElement.parentElement;
  trashDialogue.showModal();
}

function addTask(information) {
  // function will be used when a task is added from other within the project page
}

function getColor() {
  if (colorNumber === 5) {
    colorNumber = 0;
  }
  let currentColor = colors[colorNumber];
  colorNumber++;
  return currentColor;
}

function showProjectDialogue() {
  projectNameInput.value = '';
  projectDialogue.showModal()
}

function closeProjectDialogue() {
  projectDialogue.close()
}

function closeTrashDialogue() {
  trashDialogue.close()
}

function addListener(element, event, func) {
  if (element) {
    element.addEventListener(event, func)
  }
}

addListener(addProjectPrompt, 'click', showProjectDialogue);
addListener(cancelProjectButton, 'click', closeProjectDialogue);
addListener(addProjectButton, 'click', giveProjectInfo);
addListener(cancelTrashButton, 'click', closeTrashDialogue);
addListener(yesTrashButton, 'click', trashProject);
addListener(document, 'DOMContentLoaded', loadProjectCards);

window.addEventListener('load', () => {
  document.body.style.visibility = 'visible';
});

export { addTask, makeSidebarCard }