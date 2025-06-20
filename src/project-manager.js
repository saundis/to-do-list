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

    removeTask(taskName) {
        delete this.tasks[taskName];
        // Change in localstorage
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
        localStorageManager.addToStorage(newProject);

        // To associate DOM element with the project's key (used to identify which project is which)
        return newProject.key;
    }

    // Returns both the project object and it's// index in the list
    const getProject = (key) => {
        for (let i = 0; i < projectsList.length; i++) {
            console.log(projectsList[i].key);
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
        localStorageManager.removeFromStorage(project[0]);
    }

    const parseTask = (taskInformation) => {
        // parsing it for DOM related stuff
        // only time and date need to be changed
        let newTime = taskInformation.time.split(':');
        let end = 'AM';
        console.log(parseInt(newTime[0]));
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
        return parseTask(task);
    }

    const editTask = () => {

    }

    const removeTask = (projectKey, taskName) => {
        let project = getProject(projectKey)[0];
        project.removeTask(taskName);
    }

    return { addProject, getProject, trashProject, loadProjects, addTask, removeTask };
})();

const localStorageManager = (() => {
    const addToStorage = (project) => {
        // adding project to storage
        const storageKey = getStorageKey();

        localStorage.setItem(storageKey, JSON.stringify(project));
    }

    const changeTaskInStorage = () => {
        // changing some info about project in storage
    }

    const changeCurrentProjectPage = (key) => {
        localStorage.setItem('currentPage', key);
    }

    const getCurrentProjectPage = () => {
        return localStorage.getItem('currentPage');
    }

    const removeFromStorage = (project) => {
        // It has to find the object that's associated with the project key since the project key
        // isn't the key in localstorage
        console.log('test1');
        for (let obj of localStorageManager.getAllProjectsInStorage()) {
            if (obj._key == project.key) {
                localStorage.removeItem(obj.storageKey);
            }
        }
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

    return { addToStorage, changeTaskInStorage, changeCurrentProjectPage, getCurrentProjectPage, removeFromStorage, getAllProjectsInStorage };
})();

export { projectManager };
export const { changeCurrentProjectPage, getCurrentProjectPage } = localStorageManager;