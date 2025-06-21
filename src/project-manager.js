import { format, differenceInCalendarDays, differenceInCalendarYears } from "date-fns";

class Project {
    constructor(projectName, key = null, tasks = null, color = null) {
        // the key and tasks parameters are used when creating objects for items saved in localstorage
        // (the data already exists)
        this._projectName = projectName;
        if (key) {
            this._key = key
        } 
        else {
            this._key = crypto.randomUUID();
        }
        this._projectName = projectName;
        if (tasks) {
            this.tasks = tasks;
        } 
        else {
            this.tasks = [];
        }
        this._color = color;
    }

    get key() {
        return this._key;
    }

    get projectName() {
        return this._projectName;
    }

    get color() {
        return this._color;
    }

    set color(color) {
        this._color = color;
    }

    addTask(taskInfo) {
        // taskInfo = {name, description, date, time, priority}
        let newTask = taskInfo;
        const taskKey = crypto.randomUUID();
        newTask.key = taskKey;
        let currTasks = this.tasks;
        currTasks.push(newTask);
        return newTask;
    }

    editTask(task, taskInfo) {
        task.name = taskInfo.name;
        task.description = taskInfo.description;
        task.date = taskInfo.date;
        task.time = taskInfo.time;
        task.priority = taskInfo.priority;

        return task;
    }

    removeTask(taskKey) {
        for (let i = 0; i < this.tasks.length; i++) {
            if ((this.tasks)[i].key === taskKey) {
                this.tasks.splice(i, 1);
                break;
            }
        }
    }
}

const projectManager = (() => {
    // We need this so that we have something that manages creating/destroing/invoking methods on projects
    // and so it can be the only thing sent to the stuff dealing with the DOM
    let projectsList = []

    // On execution, get all projects from localstorage and turn them into project objects
    const loadProjects = () => {
        for (let obj of localStorageManager.getAllProjectsInStorage()) {
            let newProject = new Project(obj._projectName, obj._key, obj.tasks, obj._color);
            projectsList.push(newProject);
        }
        return projectsList;
    }

    const addProject = (projectName, color) => {
        let newProject = new Project(projectName, null, null, color);
        projectsList.push(newProject);
        localStorageManager.addProjectToStorage(newProject);

        // To associate DOM element with the project's key (used to identify which project is which)
        return newProject.key;
    }

    // Returns both the project object and it's// index in the list
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
        localStorageManager.removeProjectFromStorage(project[0]);
    }

    const parseTask = (taskInformation) => {
        // parsing it for DOM related stuff
        // only time and date need to be changed
        let newTime = taskInformation.time.split(':');
        // timeKey for sorting task items within a given day
        taskInformation.timeKey = parseInt(newTime[0]) * 60 + parseInt(newTime[1]);
        let end = 'AM';
        if (parseInt(newTime[0]) === 0) {
            newTime[0] = '12';
        }
        else if (parseInt(newTime[0]) > 12) {
            end = 'PM';
            newTime[0] = parseInt(newTime[0]) - 12;
        }
        newTime = newTime.join(':') + ' ' + end;
        taskInformation.time = newTime

        let splitDates = taskInformation.date.split('-').map(part => parseInt(part));
        const taskDate = new Date(splitDates[0], splitDates[1] - 1, splitDates[2]);
        const dateDifference = differenceInCalendarDays(taskDate, new Date())
        taskInformation.dateKey = dateDifference; // This will be used for sorting DOM
        let parsedDated;
        if (dateDifference === 0) {
            parsedDated = 'Today';
        } else if (dateDifference === 1) {
            parsedDated = 'Tomorrow';
        } else if (differenceInCalendarYears(taskDate, new Date()) > 0) {
            parsedDated = format(taskDate, 'MMMM d yyyy');
        } else {
            parsedDated = format(taskDate, 'MMMM d');
        }
        taskInformation.date = parsedDated;

        return taskInformation;
    }

    const addTask = (taskInformation) => {
        let project = getProject(localStorageManager.getCurrentProjectPage())[0];
    
        let task = project.addTask(taskInformation);
        localStorageManager.addTaskToStorage(project, task);
        return parseTask(structuredClone(task));
    }

    const editTask = (taskKey, newInformation) => {
        const project = getProject(localStorageManager.getCurrentProjectPage())[0];

        for (let task of project.tasks) {
            if (task.key === taskKey) {
                const newTask = project.editTask(task, newInformation);
                localStorageManager.changeTaskInStorage(project, newInformation, taskKey);

                return parseTask(structuredClone(newTask));
            }
        }
        return null;
    }

    const getTask = (taskKey) => {
        const project = getProject(localStorageManager.getCurrentProjectPage())[0];

        for (let task of project.tasks) {
            if (task.key === taskKey) {
                return task;
            }
        }

        return null;
    }

    const removeTask = (taskKey) => {
        let project = getProject(localStorageManager.getCurrentProjectPage())[0];
        project.removeTask(taskKey);

        localStorageManager.removeTaskFromStorage(project, taskKey);
    }

    return { addProject, getProject, trashProject, loadProjects, addTask, getTask, editTask, removeTask, parseTask };
})();

const localStorageManager = (() => {
    const addProjectToStorage = (project) => {
        // adding project to storage
        const storageKey = getStorageKey();

        localStorage.setItem(storageKey, JSON.stringify(project));
    }

    const addTaskToStorage = (project, task) => {
        let storageProject = findProjectInStorage(project);
        if (!storageProject) {
            return null;
        }

        let newStorageProject = JSON.parse(localStorage[storageProject.storageKey]);
        newStorageProject.tasks.push(task);
        localStorage[storageProject.storageKey] = JSON.stringify(newStorageProject);
    }

    const changeTaskInStorage = (project, taskInformation, taskKey) => {
        removeTaskFromStorage(project, taskKey);
        taskInformation.key = taskKey;
        addTaskToStorage(project, taskInformation);
    }

    const removeTaskFromStorage = (project, taskKey) => {
        let storageProject = findProjectInStorage(project);
        if (!storageProject) {
            return null;
        }

        let newStorageProject = JSON.parse(localStorage[storageProject.storageKey]);

        for (let i = 0; i < newStorageProject.tasks.length; i++) {
            if ((newStorageProject.tasks)[i].key === taskKey) {
                newStorageProject.tasks.splice(i, 1);
                break;
            }
        }

        localStorage[storageProject.storageKey] = JSON.stringify(newStorageProject);
    }

    const findProjectInStorage = (project) => {
        for (let obj of localStorageManager.getAllProjectsInStorage()) {
            if (obj._key == project.key) {
                return obj;
            }
        }

        return null;
    }

    const changeCurrentProjectPage = (key) => {
        localStorage.setItem('currentPage', key);
    }

    const getCurrentProjectPage = () => {
        return localStorage.getItem('currentPage');
    }

    const removeProjectFromStorage = (project) => {
        // It has to find the object that's associated with the project key since the project key
        // isn't the key in localstorage
        const storageObject = findProjectInStorage(project);
        localStorage.removeItem(storageObject.storageKey);
    }

    const getStorageKey = () => {
        let storageKey = localStorage.getItem('universalKey') ? localStorage.getItem('universalKey') : 0;
        localStorage.setItem('universalKey', ++storageKey);

        return storageKey;
    }

    const getAllProjectsInStorage = () => {
        const localStorageItems = { ...localStorage };
        let items = [];
        for (let obj in localStorageItems) {
            if (localStorage[obj][0] !== '{') {
                continue;
            }

            let filteredObject = JSON.parse(localStorage[obj]);
            if (typeof filteredObject === 'object') {
                filteredObject.storageKey = obj;
                items.push(filteredObject);
            }
        }
        return items;
    }

    return { 
        addProjectToStorage, addTaskToStorage, changeTaskInStorage, changeCurrentProjectPage, 
        getCurrentProjectPage, removeTaskFromStorage, removeProjectFromStorage, getAllProjectsInStorage };
})();

export { projectManager };
export const { changeCurrentProjectPage, getCurrentProjectPage } = localStorageManager;