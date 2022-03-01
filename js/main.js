//* Display "My lists" content when loading

window.addEventListener("load", (event)=> {
    fillMyLists(event);
});
function fillMyLists(ev) {
    if (myLists.length) { //* != 0
        tasksContainer.classList.add("unhide")
        for (let i = 0; i < myLists.length; i++) {
            createList(myLists[i].id, myLists[i].listName, ev)
        }
    }
}

//* Add New List and Save the entry in localStorage

listsForm.addEventListener("submit", function (event) {
    event.preventDefault()
    if (newEntry.value.trim()) {
        tasksContainer.classList.add("unhide")
        let newId = saveList(newEntry.value) // Save the new list and get it's Id
        createList(newId, newEntry.value, event)
        newEntry.value = ''
    }
})

function saveList(value) {
    let obj = {id: Date.now(), listName: value, tasks: []}
    myLists.push(obj)
    storeUpdated()
    return obj.id // To add To "data-list-id" Attribute of the new created Li
}

function createList(listId, value, evt) {
    let newList = document.createElement("LI")
    newList.innerText = value
    newList.classList.add("list")
    newList.setAttribute("data-list-id", listId)
    myListsUl.appendChild(newList)
    if (evt.type == "submit") { // Active the Clicked-On list and display its tasks in the right window
        listOnClick(newList, listId) // the Function is executed when Submiting new created List
        // Here the targeted list is known
        return
    }
    newList.addEventListener("click", (ev)=> {
        listOnClick(ev.target, listId) // the Function is executed after Click On the new created List
       // Here the targeted list is unknown
    })

}

//* On List Click OR Submiting new created List

function listOnClick(targetList, idList) {
    let activeList = document.querySelector(".active-list") || false
    if (activeList) activeList.classList.remove("active-list") // if there is an active list
    targetList.classList.add("active-list")
    listName.innerText = targetList.innerText
    listName.setAttribute("data-list-id", idList)

    fillMyTasks(idList)
}

//* Fill New List's Tasks

function fillMyTasks(idList) {
    // Remove Old List's Tasks
    while (myTasksUl.firstChild) { // Exist
        myTasksUl.lastChild.remove() // Faster then removing firstChild
    }    //OR we Can Simply Use: myTasksUl.textContent = '' // OR .replaceChildren('')
    
    // Fill New List's Tasks
    for (let i = 0; i < myLists.length; i++) {
        if (myLists[i].id == idList) {
            if (myLists[i].tasks.length) { // if there is tasks
                myLists[i].tasks.forEach((obj,index) => {
                    createTask(obj.taskContent, obj.complete, index)
                });
                refrechTasksCounter(myLists[i].tasks)
            }
        }        
    }

}

function createTask(value, checkSt, index) {

    // I used 'index' as a way to make id's unique
    let newTaskLI = document.createElement("LI")
    myTasksUl.appendChild(newTaskLI)
    let newTaskRadio = document.createElement("INPUT")
    newTaskRadio.setAttribute("type","checkbox")
    newTaskRadio.setAttribute("id",`chechbox${index}`)
    newTaskLI.appendChild(newTaskRadio)
    let newTaskLabel = document.createElement("LABEL")
    newTaskLabel.setAttribute("for",`chechbox${index}`)
    newTaskLabel.innerText = value
    newTaskRadio.after(newTaskLabel)
    let line = document.createElement("span")
    newTaskLabel.appendChild(line)

     // Display Task Status : Checked/Unchecked
    if (checkSt) { // true
        newTaskRadio.setAttribute("checked", '') // Att. without value
        line.style.width = `${newTaskLabel.offsetWidth}px` // See: https://www.javascripttutorial.net/javascript-dom/javascript-width-height/
    }
    // Add Click Event to Radio Button
    radioEvent(newTaskRadio, line, newTaskLabel)

}

function radioEvent(newTaskRadio, line, newTaskLabel) {
    newTaskRadio.addEventListener("click", function(ev) {
        
        let lineWidth = `${newTaskLabel.offsetWidth}px`  // Get the lebel's width
        let checkAtt =  newTaskRadio.hasAttribute("checked")
        checkAtt? changeStatusTo("unchecked", "0"): changeStatusTo("checked", lineWidth)
        // this.cheched? changeStatusTo(false, "0"): changeStatusTo(true, lineWidth)
 
        function changeStatusTo(status, textWidth) {
            // Clear Existed attributes
            newTaskRadio.removeAttribute("checked")
            newTaskRadio.removeAttribute("unchecked")
            
            newTaskRadio.setAttribute( status , '')
            line.style.width = textWidth // line width = Label's text width 

            // Save Completed Task's State
            saveTask(newTaskLabel.innerText, status, ev)
        }
    })
}

// Organized function (Temp)
function saveTask(task, stat, event) {
    for (var i = 0; i < myLists.length; i++) {

        if (myLists[i].id == getAttId()) {
            
            if (event.type == "submit") { // Add New Task
                let newTaskObj = {complete : false, taskContent: task}
                myLists[i].tasks.push(newTaskObj)
                refrechTasksCounter (myLists[i].tasks)
                break  // leave For Loop
            } 

            if (event.type == "click") { // Radio Button Check
                stat === "checked"? stat = true : stat = false;
                for (let x = 0; x < myLists[i].tasks.length; x++) {
                    let myTask = myLists[i].tasks[x]
                    if (myTask.taskContent == task) {
                        myTask.complete = stat // Update Check Status
                        refrechTasksCounter (myLists[i].tasks)
                        break  // leave For Loop
                    }
                }
            } 
            
        }      
    }
    storeUpdated()
}



// function saveTask(task, completed) {
//     for (let i = 0; i < myLists.length; i++) {

//         if (myLists[i].id == getAttId()) {
//             completed === "checked"? completed = true : completed = false;

//             // Test and save after Modifying checkBoxes
//             for (let x = 0; x < myLists[i].tasks.length; x++) {
    //                 if (myLists[i].tasks[x].taskContent == task) {
        //                     myLists[i].tasks[x].complete = completed
        //                     storeUpdated()
        //                     refrechTasksCounter (myLists[i].tasks)
        //                     return
        //                 }
        //      }
//             // If new Task
//             let newTaskObj = {complete : completed, taskContent: task}
//             myLists[i].tasks.push(newTaskObj)
//             storeUpdated()
//             refrechTasksCounter (myLists[i].tasks)
//         }      
//     }
// }





tasksForm.addEventListener("submit", function (event) {
    event.preventDefault()
    if (newTask.value.trim() && getAttId()) {
        createTask(newTask.value, false, Date.now()) //Date.now() = Random number to add to Input-id & label-for
        saveTask(newTask.value, false, event)
        newTask.value = ''
    } else {
        alert("Choose a list then write a task.")
    }
})

function refrechTasksCounter (tasksArray) {
    let count = 0
    tasksArray.forEach(el => { // Reduce?
        if (!el.complete) count++
    });
    
    if (count < 2) return tasksCounter.innerText = `${count} task remains.`
    tasksCounter.innerText = `${count} tasks remaining.`
}

clearBtn.onclick = function () {
    const attId = getAttId()
    if (attId) {
        for (let i = 0; i < myLists.length; i++) {
            const el = myLists[i];
            if (el.id == attId) {
                el.tasks = el.tasks.filter((elem)=> elem.complete != true)   
                storeUpdated()
                fillMyTasks(el.id)
            }
        }
    }
}

delBtn.onclick = function (evt) {
    const attId = getAttId()
    if (attId) { // if there is a list displayed
        deleteListFromLS(attId)
        storeUpdated()
        clearBefor()
        fillMyLists(evt); // Displaying Filtred lists
    }
}
function deleteListFromLS(att_id) {
    myLists = myLists.filter((el)=> el.id != att_id) // Or we can use the folowed code:
    // for (let i = 0; i< myLists.length; i++) {
    //    if (myLists[i].id == attId) {
    //        myLists.splice(i, 1)
    //        break  // Stop the loop
    //    }
    // }
}
function clearBefor() {
    myTasksUl.replaceChildren('')  // Clear Tasks Container
    listName.innerText = "Choose a list"
    listName.setAttribute("data-list-id", '')
    tasksCounter.innerText = ''
    myListsUl.textContent = '' // Clear Lists Container
}
function getAttId() {
   return listName.getAttribute("data-list-id")
}
function storeUpdated() {
    window.localStorage.setItem("Lists.To.Do", JSON.stringify(myLists))
}