import Backend from "https://madata.dev/src/index.js";
let backend = Backend.from("https://github.com/IncoherentButter/studio9-starter/data.json");
// Get references to DOM elements
export const dom = {
	tasksList: document.querySelector("#tasks_list"),
	taskTemplate: document.querySelector("#task_template"),
	doneCount: document.querySelector("#done_count"),
	totalCount: document.querySelector("#total_count"),
	saveButton: document.querySelector("#save_button"),
	loginButton: document.querySelector("#login"),
	logoutButton: document.querySelector("#logout"),
};

// Initialize data. Do we have anything stored?
if (localStorage.tasks) {
	let tasks = JSON.parse(localStorage.tasks);
	for (let task of tasks) {
		addItem(task);
	}
}
else {
	// Add one empty task to start with
	addItem();
}

async function storeData(){
	backend.store(getData("https://github.com/IncoherentButter/studio9-starter/data.json"));
}

async function loadData(){
	let data = 	backend.load("https://github.com/IncoherentButter/studio9-starter/data.json");
}
// Save when the save button is clicked
dom.saveButton.addEventListener("click", e => {
	storeData();
});
document.addEventListener('load', (e) => {
	loadData();
})

// Keyboard shortcuts
dom.tasksList.addEventListener("keyup", e => {
	if (!e.target.matches("input.title")) {
		// We are only interested in key events on the text field
		return;
	}

	let li = e.target.closest("li");

	if (e.key === "Enter") {
		addItem();
	}
	else if (e.key === "Backspace" && e.target.previousValue === "") {
		li.querySelector(".delete").click();
	}
});


dom.tasksList.addEventListener("keydown", e => {
	if (!e.target.matches("input.title")) {
		// We are only interested in key events on the text field
		return;
	}

	let li = e.target.closest("li");

	if (e.key === "Backspace") {
		// Store previous value so we know whether to delete on keyup
		// (which is fired after the value has changed)
		e.target.previousValue = e.target.value;
	}
	// Step 3: Arrow keys to move between tasks
	else if (e.key === "ArrowUp") {
		focusTask(li.previousElementSibling ?? dom.tasksList.lastElementChild);
	}
	else if (e.key === "ArrowDown") {
		focusTask(li.nextElementSibling ?? dom.tasksList.firstElementChild);
	}
});

/**
 * Add a new item at the end of the todo list
 * @param {Object} data data for the item to be added
 */
export function addItem (data = { done: false, title: "" }) {
	dom.tasksList.insertAdjacentHTML("beforeend", dom.taskTemplate.innerHTML);

	let element = dom.tasksList.lastElementChild;

	element.querySelector(".title").value = data.title;

	let done = element.querySelector(".done");
	done.checked = data.done;
	// Step 1: Update the done count when the done checkbox is checked/unchecked
	done.addEventListener("input", e => {
		updateDoneCount();
	});

	// Step 2: Implement the delete button
	element.querySelector(".delete").addEventListener("click", e => {
		let previous = element.closest("li").previousElementSibling;
		element.remove();
		focusTask(previous);
		updateCounts();
	});

	updateCounts();
	focusTask(element);
}

/**
 * Delete all tasks that are marked as done
 */
export function clearCompleted () {
	for (let deleteButton of dom.tasksList.querySelectorAll("li:has(.done:checked) .delete")) {
		deleteButton.click();
	}
}

/**
* Focus the title field of the specified task
* @param {Node} element Reference to DOM element of the task to focus (or any of its descendants)
*/
export function focusTask (element) {
	element?.closest("li")?.querySelector("input.title").focus();
}

export function getData () {
	return Array.from(dom.tasksList.children).map(element => ({
		title: element.querySelector(".title").value,
		done: element.querySelector(".done").checked
	}));
}

function updateDoneCount () {
	dom.doneCount.textContent = dom.tasksList.querySelectorAll(".done:checked").length;
}

function updateTotalCount () {
	dom.totalCount.textContent = dom.tasksList.children.length;
}

// Update expressions etc when data changes
function updateCounts () {
	updateDoneCount();
	updateTotalCount();
}


export function login(){
	document.getElementById('app').classList.remove('logged-out');
	document.getElementById('app').classList.add('logged-in');
}

export function logout(){
	document.getElementById('app').classList.add('logged-out');
	document.getElementById('app').classList.remove('logged-in');
}

backend.addEventListener('mv-login', (e) => {
	if (backend.user.username !== undefined && backend.user.avatar !== undefined){
		document.querySelector("#user-username").textContent = backend.user.username;
		document.querySelector("#user-avatar").src = backend.user.avatar;
	}
	login();
});

backend.addEventListener('mv-logout', (e) => {
	logout();
});

dom.loginButton.addEventListener("click", (e) => {
	backend.login();
	login();
	// console.log(`login occured`);
	// console.log(`backend user = ${backend.user.username}`);
	// console.log(`backend ava = ${backend.user.avatar}`);
});

dom.logoutButton.addEventListener("click", () => {
	backend.logout();
	logout();
});