//* Display "My lists" content when loading

window.addEventListener("load", loadLists())

function loadLists() {
  if (myLists.length > 0) {
    tasksContainer.classList.add("unhide")
    myLists.forEach(({ id, listName }) => {
      createList(id, listName)
    })
  }
}

//* Add and save the new list and create its UI
listsForm.addEventListener("submit", function (event) {
  event.preventDefault()
  const userInput = newListInput.value.trim()
  if (userInput) {
    tasksContainer.classList.add("unhide")
    // Save the new list and get it's Id
    let newListId = saveList(userInput)
    // Create the new list's UI
    const newCreatedList = createList(newListId, userInput)
    // Trigger 'handleListClick' to display the new list in the tasks UI
    handleListClick(newCreatedList, newListId)

    newListInput.value = ""
  }
})

function saveList(input) {
  const newList = { id: Date.now(), listName: input, tasks: [] }
  myLists.push(newList)
  storeUpdated()
  return newList.id // To add To "data-list-id" Attribute of the new created Li
}

function createList(listId, value) {
  let newList = document.createElement("LI")
  newList.innerText = value
  newList.classList.add("list")
  newList.setAttribute("data-list-id", listId)
  myListsUl.appendChild(newList)
  newList.addEventListener("click", () => {
    handleListClick(newList, listId)
  })
  return newList
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
  const listFound = findList(listId)
  if (listFound && listFound.tasks.length > 0) {
    listFound.tasks.forEach(createTask) // == .forEach(({ taskContent, complete }[= task], task_index) => {--code--})
    refrechTasksCounter(listFound.tasks)
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

  addClickEventToRadioBtn(newTaskRadio, line, newTaskLabel)
}

function addClickEventToRadioBtn(radioElement, line, labelElement) {
  radioElement.addEventListener("click", () => {
    let lineWidth = `${labelElement.offsetWidth}px` // Get the lebel's width
    let isChecked = radioElement.hasAttribute("checked")
    updateStatus(
      isChecked
        ? { status: "unchecked", textWidth: "0" }
        : { status: "checked", textWidth: lineWidth }
    )

    function updateStatus({ status, textWidth }) {
      // Clear Existed attributes
      radioElement.removeAttribute("checked")
      radioElement.removeAttribute("unchecked")
      radioElement.setAttribute(status, "")
      // Set the cross line's width = labelElement's width
      line.style.width = textWidth
      // Save Completed Task's State
      const taskToSave = {
        taskContent: labelElement.innerText,
        checked: status,
      }
      saveTaskStatus(taskToSave)
    }
    return false
  })
}

function saveTaskStatus(taskToSave) {
  let { taskContent, checked } = taskToSave
  const listFound = findList(getActiveListId())
  if (!listFound) return
  for (let i = 0; i < listFound.tasks.length; i++) {
    if (listFound.tasks[i].taskContent === taskContent) {
      // Update Check Status
      listFound.tasks[i].complete = checked === "checked" ? true : false
      break
    }
  }
  refrechTasksCounter(listFound.tasks)
  storeUpdated()
}

function saveTask(taskToSave) {
  const listFound = findList(getActiveListId())
  if (!listFound) return
  listFound.tasks.push(taskToSave)
  refrechTasksCounter(listFound.tasks)
  storeUpdated()
}

tasksForm.addEventListener("submit", function (event) {
  event.preventDefault()
  const taskInput = newTaskInput.value.trim()
  if (!taskInput) return
  if (getActiveListId()) {
    const taskData = { taskContent: taskInput, complete: false }
    //Date.now() = Random number to add to Input-id & label-for
    createTask(taskData, Date.now())
    saveTask(taskData)
    newTaskInput.value = ""
  } else {
    tasksCounter.innerText = "Please choose a list first."
  }
})

function refrechTasksCounter(tasksArray) {
  if (tasksArray.length > 0) {
    const count = tasksArray.reduce((acc, task) => {
      if (!task.complete) acc++
      return acc
    }, 0)

    tasksCounter.innerText = `${count} ${count < 2 ? "task" : "tasks"} remains.`
  }
}

clearBtn.onclick = function () {
  const activeListId = getActiveListId()
  if (activeListId) {
    const listFound = findList(activeListId)
    listFound.tasks = listFound.tasks.filter((task) => task.complete === false)
    storeUpdated()
    loadTasks(listFound.id)
  }
}

deleteBtn.onclick = function () {
  const activeListId = getActiveListId()
  if (activeListId) {
    deleteList(activeListId)
    storeUpdated()
    clearListUI(activeListId)
  }
}

function deleteList(attrId) {
  const index = myLists.findIndex((list) => list.id === attrId)
  if (index > -1) myLists.splice(index, 1)
  // Or: myLists = myLists.filter(list => list.id != attrId)
}

function clearListUI(activeListId) {
  clearTasksUI()
  deleteListElement(activeListId)
}

function clearTasksUI() {
  myTasksUl.replaceChildren("") // Clear Tasks Container
  listName.innerText = "Choose a list"
  listName.setAttribute("data-list-id", "")
  tasksCounter.innerText = ""
}

function deleteListElement(listId) {
  const element = document.querySelector(`[data-list-id="${listId}"]`)
  element.remove()
}

function getActiveListId() {
  const element_id = listName.getAttribute("data-list-id")
  // Note: getAttribute() return a String
  return Number(element_id)
}

function storeUpdated() {
  window.localStorage.setItem("Lists.To.Do", JSON.stringify(myLists))
}
