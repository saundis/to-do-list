class Project {
    constructor(projectName) {
        this._key = crypto.randomUUID();
        this._projectName = projectName;
        this.tasks = {};
        // It should look something like:
        // {June 17 (or some key to represent date): [{some task}, {some task}]}
    }

    get key() {
        return this._key;
    }

    get projectName() {
        return this._projectName;
    }

    addTask(taskInfo) {
        let newTask = {};
        const taskKey = crypto.randomUUID()
        // Structure and add some more information such as date, priority, etc.
        this.tasks[taskKey] = newTask;
        // returns taskKey so that it can be associated in the DOM
        return taskKey
    }

    removeTask(taskName) {
        delete this.tasks[taskName];
        // Change in localstorage
    }
}

const projectManager = (() => {
    // We need this so that we have something that manages creating/destroing/invoking methods on projects
    // and so it can be the only thing sent to the stuff dealing with the DOM
    let projectsList = []

    const addProject = (projectName) => {
        let newProject = new Project(projectName);
        projectsList.push(newProject);
        localStorageManager.addToStorage(newProject);

        console.log(newProject);
        // To associate DOM element with the project's key (used to identify which project is which)
        console.log(projectsList)
        return newProject.key;
    }

    // Returns both the project object and it's index in the list
    const getProject = (key) => {
        for (let i = 0; i < projectsList.length; i++) {
            if (projectsList[i].key === key) {
                return [projectsList[i], i];
            }
        }
        return null;
    }

    const trashProject = (projectKey) => {
        let project = getProject(projectKey);
        if (!project) {
            return;
        }
        projectsList.splice(project[1], 1);

        console.log(projectsList)
    }

    const addTask = (projectKey, taskInfo) => {
        // **THE TASKINFO SHOULD NOT BE ORGANIZED IN DOM.JS, IT SHOULD BE ORGANIZED IN THE CLASS 
        // (single responsibility principle)
        let project = getProject(projectKey)[0];

        // returns key to associate task
        return project.addTask(taskInfo);
    }

    const editTask = (projectKey, taskInfo) => {
        let project = getProject(projectKey)[0];

        // returns key to associate task
        return project.addTask(taskInfo);
    }

    const removeTask = (projectKey, taskName) => {
        let project = getProject(projectKey)[0];
        project.removeTask(taskName);
    }

    return { addProject, trashProject, addTask, removeTask };
})();

const localStorageManager = (() => {
    const addToStorage = () => {
        // adding project to storage
    }

    const changeInStorage = () => {
        // changing some info about project in storage
    }

    return { addToStorage, changeInStorage };
})();

export { projectManager };