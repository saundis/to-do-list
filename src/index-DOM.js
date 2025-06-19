import './style.css';
import { projectManager } from './project-manager.js';
import { loadProjectPage } from './project-page/projects-DOM.js'
import trashIcon from '../images/trash.svg';
const requirePounds = require.context('../images/pounds', false, /\.svg$/);
const poundImages = requirePounds.keys().map(requirePounds);

const projectDialogue = document.querySelector('.add-project');
const projectNameInput = projectDialogue.querySelector('#title');
const cancelProjectButton = projectDialogue.querySelector('.cancel');
const addProjectButton = projectDialogue.querySelector('.add');

const trashDialogue = document.querySelector('.trash-dialogue');
const cancelTrashButton= trashDialogue.querySelector('.no');
const yesTrashButton = trashDialogue.querySelector('.yes');
// trashItem will be a reference to the card that might being deleted
let trashItem;

const sidebarList = document.querySelector('.sidebar ul');

const addProjectPrompt = document.querySelector('#project');
const container = document.querySelector('.main .container');

const colors = ['red', 'green', 'pink', 'blue', 'orange'];
let colorNumber = 0;

function getProjectInfo() {
  let projectName = projectNameInput.value;
  if (projectName === '') {
    return;
  }

  let key = projectManager.addProject(projectName);
  if (!key) {
    return;
  }

  makeProjectCard({ key, projectName });
}

function makeSidebarCard(information, color) {
  const listElement = document.createElement('li');
  listElement.dataset.key = information.key

  const newButton = document.createElement('button');
  newButton.classList.add('project');

  const hashTag = document.createElement('img');
  hashTag.src = poundImages[colors.indexOf(color)];

  const title = document.createElement('div');
  title.textContent = information.projectName

  newButton.append(hashTag);
  newButton.append(title);
  listElement.append(newButton);
  sidebarList.append(listElement);
}

function makeProjectCard(information) {
  const card = document.createElement('div');
  card.classList.add('card');
  card.dataset.key = information.key
  card.addEventListener('click', cardClicked);
  let color = getColor()
  card.classList.add(color);
  makeSidebarCard(information, color);

  const cardInside = document.createElement('div');
  cardInside.classList.add('inside');

  const title = document.createElement('h2');
  title.textContent = information.projectName;

  const list = document.createElement('ul');

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

function cardClicked(event) {
  const element = event.target;
  if (element.classList.contains('trash')) {
    showTrashDialogue(element)
  }
  else {
    let key;

    loadProjectPage()
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
addListener(addProjectButton, 'click', getProjectInfo);
addListener(cancelTrashButton, 'click', closeTrashDialogue);
addListener(yesTrashButton, 'click', trashProject);

window.addEventListener('load', () => {
  document.body.style.visibility = 'visible';
});

export { makeProjectCard, addTask }