let myLists = JSON.parse(window.localStorage.getItem("Lists.To.Do")) || []
let myListsUl = document.querySelector(".listsWrapper")
let myTasksUl = document.querySelector(".tasksWrapper")
let tasksContainer = document.querySelector("aside.tasksContainer")
let listsForm = document.forms["addListForm"]
let tasksForm = document.forms["addTaskForm"]
let newEntry = listsForm["newEntryInput"]
let newTask = tasksForm["newTaskInput"]
let listName = document.querySelector("h3.listName")
let tasksCounter = document.querySelector(".tasksCounter")
let clearBtn = document.querySelector(".clear")
let delBtn = document.querySelector(".delete")



// let radio = document.querySelector("#task1")
