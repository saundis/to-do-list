import '../style.css';

const main = document.querySelector('.main');

const goBackButton = main.querySelector('#back');

function loadProjectPage(key) {
  window.location.href = '../project-page/projects.html';
}

function goBack() {
  window.location.href = '../index.html';
}

function addListener(element, event, func) {
  if (element) {
    element.addEventListener(event, func)
  }
}

addListener(goBackButton, 'click', goBack);

window.addEventListener('load', () => {
  document.body.style.visibility = 'visible';
});

export { loadProjectPage }