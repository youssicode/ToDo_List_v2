//* Display "My lists" content when loading

window.addEventListener("load", (event) => {
  loadLists(event)
})

function loadLists(event) {
  if (myLists.length > 0) {
    tasksContainer.classList.add("unhide")
    myLists.forEach(({ id, listName }) => {
      createList(id, listName, event)
    })
  }
}

//* Add and save the new list and create its UI
listsForm.addEventListener("submit", function (event) {
  event.preventDefault()
  const userInput = newEntry.value.trim()
  if (userInput) {
    tasksContainer.classList.add("unhide")
    let newListId = saveList(userInput) // Save the new list and get it's Id
    createList(newListId, userInput, event)
    newEntry.value = ""
  }
})

function saveList(input) {
  const newList = { id: Date.now(), listName: input, tasks: [] }
  myLists.push(newList)
  storeUpdated()
  return newList.id // To add To "data-list-id" Attribute of the new created Li
}

function createList(listId, value, event) {
  let newList = document.createElement("LI")
  newList.innerText = value
  newList.classList.add("list")
  newList.setAttribute("data-list-id", listId)
  myListsUl.appendChild(newList)
  newList.addEventListener("click", () => {
    handleListClick(newList, listId)
  })

  // Trigger 'handleListClick' to display the new list in the tasks UI
  if (event.type == "submit") handleListClick(newList, listId)
}

//* On List Click OR Submiting new created List
function handleListClick(targetList, listId) {
  let activeList = document.querySelector(".active-list") || false
  if (activeList) activeList.classList.remove("active-list") // if there is an active list
  targetList.classList.add("active-list")
  listName.innerText = targetList.innerText
  listName.setAttribute("data-list-id", listId)

  loadTasks(listId)
}

//* Load New List's Tasks
function loadTasks(listId) {
  // Remove old list's tasks
  myTasksUl.replaceChildren("")

  // Fill with new list's tasks
  const list_found = findList(listId)
  if (list_found && list_found.tasks.length > 0) {
    list_found.tasks.forEach(createTask) // == .forEach(({ taskContent, complete }[= task], task_index) => {--code--})
    refrechTasksCounter(list_found.tasks)
  } else {
    tasksCounter.innerText = "No tasks yet."
  }
}

// Find List by Id (Using Binary Search)
function findList(listId) {
  let start = 0
  let end = myLists.length - 1
  while (start <= end) {
    const mid_index = Math.floor((start + end) / 2)
    if (myLists[mid_index].id === listId) return myLists[mid_index]
    if (myLists[mid_index].id < listId) start = mid_index + 1
    if (myLists[mid_index].id > listId) end = mid_index - 1
  }
  return false
}

function createTask({ taskContent, complete }, index) {
  let newTaskLI = document.createElement("LI")
  myTasksUl.appendChild(newTaskLI)

  let newTaskRadio = document.createElement("INPUT")
  newTaskRadio.setAttribute("type", "checkbox")
  // I used 'index' as a way to make a unique id
  newTaskRadio.setAttribute("id", `chechbox${index}`)
  newTaskLI.appendChild(newTaskRadio)

  let newTaskLabel = document.createElement("LABEL")
  newTaskLabel.setAttribute("for", `chechbox${index}`)
  newTaskLabel.innerText = taskContent
  newTaskRadio.after(newTaskLabel)

  let line = document.createElement("SPAN")
  newTaskLabel.appendChild(line)

  // Display Task Status : Checked/Unchecked
  if (complete) {
    newTaskRadio.setAttribute("checked", "") // Att. without value
    // Define the cross line's width to be the same as the text's width
    line.style.width = `${newTaskLabel.offsetWidth}px`
  }

  // Add Click Event to Radio Button
  radioEvent(newTaskRadio, line, newTaskLabel)
}

function radioEvent(radioElement, line, label) {
  radioElement.addEventListener("click", function () {
    try {
      let lineWidth = `${label.offsetWidth}px` // Get the lebel's width
      let checkAtt = radioElement.hasAttribute("checked")
      checkAtt
        ? changeStatusTo("unchecked", "0")
        : changeStatusTo("checked", lineWidth)

      function changeStatusTo(status, textWidth) {
        // Clear Existed attributes
        radioElement.removeAttribute("checked")
        radioElement.removeAttribute("unchecked")

        radioElement.setAttribute(status, "")
        line.style.width = textWidth // line width = Label's text width

        // Save Completed Task's State
        const task_to_save = {
          taskContent: label.innerText,
          checked: status,
        }
        saveTaskStatus(task_to_save)
        //! saveTask(task_to_save, ev)
      }
    } catch (error) {
      console.error(error)
    }
    return false
  })
}

function saveTaskStatus(task_to_save) {
  let { taskContent, checked } = task_to_save
  const list_found = findList(getAttId())
  if (!list_found) return
  for (let i = 0; i < list_found.tasks.length; i++) {
    if (list_found.tasks[i].taskContent == taskContent) {
      // Update Check Status
      list_found.tasks[i].complete = checked === "checked" ? true : false
      break
    }
  }
  refrechTasksCounter(list_found.tasks)
  storeUpdated()
}

function saveTask(task_to_save) {
  const list_found = findList(getAttId())
  if (!list_found) return
  list_found.tasks.push(task_to_save)
  refrechTasksCounter(list_found.tasks)
  storeUpdated()
}

tasksForm.addEventListener("submit", function (event) {
  event.preventDefault()
  const task_input = newTask.value.trim()
  if (task_input && getAttId()) {
    const new_task = { taskContent: task_input, complete: false }
    //Date.now() = Random number to add to Input-id & label-for
    createTask(new_task, Date.now())
    saveTask(new_task)
    newTask.value = ""
  } else {
    alert("Choose a list then write a task.")
  }
})

function refrechTasksCounter(tasksArray) {
  let count = 0
  if (tasksArray.length > 0) {
    tasksArray.forEach((el) => {
      // Reduce?
      if (!el.complete) count++
    })
  }

  return (tasksCounter.innerText = `${count} ${
    count < 2 ? "task" : "tasks"
  } remains.`)
}

clearBtn.onclick = function () {
  const attId = getAttId()
  if (attId) {
    for (let i = 0; i < myLists.length; i++) {
      const el = myLists[i]
      if (el.id == attId) {
        el.tasks = el.tasks.filter((elem) => elem.complete != true)
        storeUpdated()
        loadTasks(el.id)
      }
    }
  }
}

delBtn.onclick = function (evt) {
  const attId = getAttId()
  if (attId) {
    // if there is a list displayed
    deleteListFromLS(attId)
    storeUpdated()
    clearBefor()
    loadLists(evt) // Displaying Filtred lists
  }
}
function deleteListFromLS(att_id) {
  myLists = myLists.filter((list) => list.id != att_id) // Or we can use the folowed code:
}
function clearBefor() {
  myTasksUl.replaceChildren("") // Clear Tasks Container
  listName.innerText = "Choose a list"
  listName.setAttribute("data-list-id", "")
  tasksCounter.innerText = ""
  myListsUl.textContent = "" // Clear Lists Container
}
function getAttId() {
  const element_id = listName.getAttribute("data-list-id")
  // Note: element_id is a String
  return Number(element_id)
}
function storeUpdated() {
  window.localStorage.setItem("Lists.To.Do", JSON.stringify(myLists))
}
