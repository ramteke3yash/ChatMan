// base URL for API requests
const BASE_URL = "http://localhost:3000";

/*****************************FRONTEND******************************/

// DOM elements
const showGroupsButton = document.getElementById("showGroups");
const showUsersButton = document.getElementById("showUsers");
const groupsDiv = document.getElementById("groups");
const usersDiv = document.getElementById("users");
const chatBox = document.getElementById("chatBox");

//Flags and state variables
let USER_TOGGLE = true; //user panel visibility
let GROUP_TOGGLE = true; //group panel visibility
let GROUP_ID = 0;

//Function to be executed when the page loads
onload = () => {
  loadGroup(null, GROUP_ID); //load initial group data
};

//Event listeners for the (Show Groups) button
showGroupsButton.addEventListener("click", () => {
  //toggle visibility classes for the group panel
  groupsDiv.classList.toggle("hidden");
  groupsDiv.classList.toggle("w-3/12");
  groupsDiv.classList.toggle("lg:w-3/12");
  groupsDiv.classList.toggle("md:w-1/2");
  groupsDiv.classList.toggle("sm:w-full");

  // Hide the users panel
  usersDiv.classList.add("hidden");
  usersDiv.classList.remove("w-3/12");
  usersDiv.classList.remove("lg:w-3/12");
  usersDiv.classList.remove("md:w-1/2");
  usersDiv.classList.remove("sm:w-full");

  //Conditionally append groups only if the groups panel was not visible
  if (GROUP_TOGGLE) {
    USER_TOGGLE = true;
    appendGroups();
    GROUP_TOGGLE = false;
  } else GROUP_TOGGLE = true;
});

// Event listener for the (Show Users) button
showUsersButton.addEventListener("click", () => {
  // Toggle visibility classes for the users panel
  usersDiv.classList.toggle("hidden");
  usersDiv.classList.toggle("w-3/12");
  usersDiv.classList.toggle("lg:w-3/12");
  usersDiv.classList.toggle("md:w-1/2");
  usersDiv.classList.toggle("sm:w-full");

  //Hide the groups panel
  groupsDiv.classList.add("hidden");
  groupsDiv.classList.remove("w-3/12");
  groupsDiv.classList.remove("lg:w-3/12");
  groupsDiv.classList.remove("md:w-1/2");
  groupsDiv.classList.remove("sm:w-full");

  // Conditionally append active users only if the users panel was not visible
  if (USER_TOGGLE) {
    appendActiveUsers();
    GROUP_TOGGLE = true;
    USER_TOGGLE = false;
  } else USER_TOGGLE = true;
});

/**
 * Asynchronously appends a list of active users to the users panel.
 * If no group is selected, a message is displayed indicating the need to select a group.
 */
async function appendActiveUsers() {
  try {
    // Check if no group is selected
    if (GROUP_ID === 0) {
      // Display a message prompting the user to select a group
      usersDiv.innerHTML = `
      <div class="bg-gray-950 rounded flex p-4 items-center mb-3">
        <span class="title-font font-medium text-white w-full text-center">
          Please select a group to see participants!
        </span>
      </div>`;
      return;
    }
    //Fetch active users and admins from the selected groups
    const response = await axios.get(BASE_URL + "/chat/activeUsers", {
      headers: {
        groupId: GROUP_ID,
      },
    });

    //Extract active users and admins from the response
    const activeUsers = response.data.users;
    const admins = response.data.admins;

    //Extract admin IDs for the easy comparison
    const adminIds = admins.map((admin) => admin.id);

    //Display a header for the users section
    usersDiv.innerHTML = `
    <div class="bg-gray-950 rounded flex p-4 items-center mb-3">
      <span class="title-font font-medium text-white w-full text-center">
        Users
      </span>
    </div>`;

    // Iterate through active users and display user information
    for (const user of activeUsers) {
      usersDiv.innerHTML += `<div class="bg-gray-800 rounded flex p-4 items-baseline mb-3">
      <span class="title-font font-medium text-white w-full text-center">
      <p>${user.name}</p>
      <p class="text-xs w-full text-center font-small text-gray-600">${
        adminIds.includes(user.id) ? "Admin" : ""
      }</p>
      </span>
      <span class="text-xs w-full text-center">
      ${user.email}
      </span>
      </div>`;
    }
  } catch (err) {
    // Handle errors by logging to the console
    console.log(err);
  }
}

/**
 * Asynchronously appends a list of groups to the groups panel.
 * Additionally, includes a button to create a new group.
 */
async function appendGroups() {
  try {
    // Fetch all user groups from the server
    const res = await axios.get(BASE_URL + "/group/all");
    const { userGroups: groups } = res.data;

    // Display a button to create a new group
    groupsDiv.innerHTML = `
    <div class="bg-gray-950 rounded flex p-4 items-center mb-3">
            <button
              class="text-white h-full bg-indigo-500 border-0 py-2 px-4 focus:outline-none hover:bg-indigo-600 rounded text-lg w-full text-center"
              onclick="createNewGroup()"
            >
              New Group
            </button>
          </div>
    `;

    //Iterate through groups and display each group as a clickable item
    for (const group of groups) {
      groupsDiv.innerHTML += `
      <div class="hover:cursor-pointer focus:outline-none hover:bg-gray-600 bg-gray-800 rounded flex p-4 items-center mb-3" onclick="loadGroup(this, ${group.id})">
          <span class="title-font font-medium text-white w-full text-center">
            ${group.name}
          </span>
      </div>
      `;
    }
  } catch (err) {
    console.error(err);
  }
}

/**
 * Asynchronously loads the chat content for the specified group.
 * Updates the group name, chat box, and displays admin tools.
 * @param {HTMLElement} element - The HTML element that triggered the group load (can be null).
 * @param {number} groupId - The ID of the group to load.
 */
async function loadGroup(element, groupId) {
  // Check if a default group is selected
  if (groupId === 0) {
    //Update UI elements for the default group
    document.getElementById("groupName").textContent = "ChatMan";
    chatBox.textContent =
      "Please select a group or create one to begin chatting!";
    document.getElementById("ipHandler").style.display = "none";
  } else {
    //Update UI elements for the selected group
    document.getElementById("groupName").textContent =
      element.lastElementChild.textContent;
    chatBox.textContent = "";
    document.getElementById("ipHandler").style.display = "";

    //load the chat content for the selected group
    await loadGroupchat(groupId);

    //Scroll to the bottom of the chat box
    chatBox.scrollTop = chatBox.scrollHeight;

    //Update the global group ID
    GROUP_ID = groupId;

    //Append admin tools and switch to the groups view
    await appendAdminTools();
    showGroupsButton.click();
  }
}

/**
 * Appends a new chat message to the chat box.
 * @param {string} message - The message content.
 * @param {string} name - The name of the user sending the message.
 * @param {string} url - The URL associated with the message (optional).
 * @param {string} createdAt - The timestamp when the message was created.
 */
function showMessage(message, name, url, createdAt) {
  chatBox.innerHTML += `
    <div class="bg-gray-800 rounded text-start p-4 my-3 mx-3">
      <span class="text-white">${name}:&nbsp</span>
      <div class="bg-gray-800 my-1">
        ${url ? `<img   src ="${url}"  />` : ""}
      </div>
      ${message ? message : ""}
      <p class="text-xs text-gray-400 mt-1">${createdAt}</p>
    </div>
  `;
}

/*****************************BACKEND******************************/

/**
 * Asynchronously fetches messages for a specified group and updates the local storage with the latest message ID.
 * If the group ID is less than or equal to zero, the function returns null.
 * @param {number} groupId - The ID of the group for which messages are to be fetched.
 */
async function fetchMessages(groupId) {
  try {
    // check if the group ID is valid
    if (groupId <= 0) return null;

    //Retrieve stored messages from local storage
    let storedMessages = JSON.parse(localStorage.getItem("storedMessages"));

    // Retrieve the last stored message ID for the specified group
    let lastMessageId = localStorage.getItem(groupId);

    // Set lastMessageId to 0 if not present in local storage
    if (!lastMessageId) lastMessageId = 0;

    //Make an asynchronous HTTP GET request to fetch messages for the specified group
    const res = await axios.get(BASE_URL + "/chat/all", {
      headers: {
        groupId,
        lastMessageId,
      },
    });

    // Extract messages from the response
    const { messages } = res.data;

    // Update the lastMessageId in local storage with the ID of the latest message
    if (messages.length > 0)
      localStorage.setItem(groupId, messages[messages.length - 1].id);
    else return;

    //Initialize storedMessages if not present
    if (!storedMessages) storedMessages = { groupId: [] };

    // Initailize group-specific message array if not present
    if (!storedMessages[groupId]) storedMessages[groupId] = [];

    //Process each message and update storedMessages and UI
    for (const message of messages) {
      const dateTime = message.createdAt.split("T");

      //push message details to storedMessages array
      storedMessages[groupId].push([
        message["user.name"],
        message.message,
        message.url || "",
        `${getLocalTime(dateTime[1].split(".")[0])}  ${dateTime[0]}`,
      ]);

      // Display the message in the UI
      showMessage(
        message.message,
        message["user.name"],
        message.url,
        storedMessages[groupId][storedMessages[groupId].length - 1][3]
      );
    }

    //Update local Storage with the modified storedMessages
    await localStorage.setItem(
      "storedMessages",
      JSON.stringify(storedMessages)
    );
    //Scroll the chat box to the bottom
    chatBox.scrollTop = chatBox.scrollHeight;
  } catch (err) {
    //Handle err
    console.error(err);
  }
}

/**
 * Converts a GMT time string to local time and returns the formatted time.
 * @param {string} gmtTimeString - The GMT time string to be converted.
 * @returns {string} - The formatted local time.
 */
function getLocalTime(gmtTimeString) {
  const gmtTime = new Date(`1970-01-01T${gmtTimeString}Z`);
  return gmtTime.toLocaleTimeString();
}

/**
 * Asynchronously sends a message to the server, including optional file attachment,
 * for the current group. Clears input fields after sending.
 * @throws {Error} If there is an issue with the HTTP request or response.
 */
async function sendMessage() {
  try {
    // Get references to message and file input elements
    const messageInput = document.getElementById("message");
    const fileInput = document.getElementById("fileInput");

    // Extract message and file data from input elements
    const message = messageInput.value;
    const file = fileInput.files[0];

    // Check if both message and file are empty, and return if true
    if (!message && !file) {
      return;
    }

    //Create a FormData object to send message and file data as as multipart/form-data request
    const formData = new FormData();
    formData.append("message", message);
    formData.append("file", file);
    formData.append("groupId", GROUP_ID);

    // Define headers for the HTTP request
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    //Make an asynchronous HTTP POST request to send the message and file to the server
    const res = await axios.post(
      BASE_URL + "/chat/saveMessage",
      formData,
      config
    );

    //Clear message and file input fields after successful message sending
    messageInput.value = "";
    fileInput.value = "";

    //Trigger click event to discard any selected image
    document.getElementById("discardImage").click();
  } catch (err) {
    //Handle err
    console.error(err);
  }
}

// Periodically fetch messages for the current group every second
setInterval(async () => {
  await fetchMessages(GROUP_ID);
}, 1000);

/**
 * Asynchronously loads and displays stored messages for a specific group in the chat box.
 * @param {number} groupId - The ID of the group for which messages are to be loaded.
 */
async function loadGroupchat(groupId) {
  chatBox.innerHTML = "";
  const storedMessages = JSON.parse(localStorage.getItem("storedMessages"));
  if (!storedMessages || !storedMessages[groupId]) return;
  for (const message of storedMessages[groupId]) {
    showMessage(message[1], message[0], message[2], message[3]);
  }
}

// Event listener for the "Enter" key to send a message
document.getElementById("message").addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

// Event handlers to clear the new group form overlay
document.getElementById("overlay").onclick = clearNewGroupForm;
document.getElementById("adminOverlay").onclick = clearUpdateGroupForm;
document.getElementById("closeForm").onclick = clearNewGroupForm;

/**
 * Clears the new group form overlay by resetting input fields and closing the modal.
 */
function clearNewGroupForm() {
  const modal = document.getElementById("modal");
  const groupNameField = document.getElementById("group-name");
  const usersList = document.getElementById("usersList");

  usersList.innerHTML = "";
  groupNameField.value = "";

  if (modal.classList.contains("-z-10")) return;

  modal.classList.toggle("z-10");
  modal.classList.toggle("-z-10");
}

/**
 * Asynchronously opens the new group form overlay and appends all available users for selection.
 */
async function createNewGroup() {
  try {
    const modal = document.getElementById("modal");
    modal.classList.toggle("-z-10");
    modal.classList.toggle("z-10");
    await appendAllUsers();
    document.getElementById("closeForm").focus();
  } catch (err) {
    console.error(err);
  }
}

/**
 * Asynchronously submits new group data to the server for creation.
 * Validates input, handles errors, and updates the UI on success.
 */
async function submitNewGroupData() {
  const groupNameField = document.getElementById("group-name");
  try {
    // Select checkboxes for users to be added and assigned as admins
    const addCheckboxes = document.querySelectorAll('input[name^="user-add"]');
    const adminCheckboxes = document.querySelectorAll(
      'input[name^="user-admin"]'
    );

    //Validate that the number of addCheckboxes is equal to adminCheckboxes
    if (addCheckboxes.length != adminCheckboxes.length)
      throw new Error("Error!");

    //Extract and validate the group name
    const groupName = groupNameField.value;

    if (groupName.length < 1 || groupName.length > 30) {
      //Handle invalid group name, display placeholder error, and clear input
      groupNameField.value = "";
      groupNameField.classList.toggle("placeholder-red-600");
      groupNameField.setAttribute(
        "placeholder",
        "Enter a name 1 - 30 characters long."
      );
      setTimeout(() => {
        groupNameField.classList.toggle("placeholder-red-600");
        groupNameField.setAttribute("placeholder", "");
      }, 3000);
      throw new Error("Invalid group name!");
    }

    //Initialize arrays to store selected participants and admins
    const participants = [];
    const admins = [];

    //Iterate through checkboxes and populate participants and admins arrays
    for (let i = 0; i < addCheckboxes.length; i++) {
      if (addCheckboxes[i].checked) {
        participants.push(addCheckboxes[i].value);
        if (adminCheckboxes[i].checked) admins.push(adminCheckboxes[i].value);
      }
    }

    //Make an asynchronous HTTP POST request to create a new group
    const res = await axios.post(BASE_URL + "/group/create", {
      groupName,
      participants,
      admins,
    });

    // extract the newly created group's ID from the server response
    const groupId = res.data.id;
    clearNewGroupForm();
    showGroupsButton.click();
    GROUP_ID = groupId;
    loadGroup({ lastElementChild: { textContent: groupName } }, groupId);
  } catch (err) {
    // Handle errors, display placeholder error, and clear the new group form
    groupNameField.value = "";
    groupNameField.classList.toggle("placeholder-red-600");
    groupNameField.setAttribute(
      "placeholder",
      "Something went wrong, please try again later."
    );
    setTimeout(() => {
      groupNameField.classList.toggle("placeholder-red-600");
      groupNameField.setAttribute("placeholder", "");
      clearNewGroupForm();
    }, 3000);
    console.error(err);
  }
}

/**
 * Asynchronously retrieves all users from the server and appends them to the users list in the new group form.
 * Enables users to be added to a group and assigned as administrators.
 */
async function appendAllUsers() {
  try {
    // Retrieve the users list container from the DOM
    const usersList = document.getElementById("usersList");

    //Make an asynchronous HTTP GET request to fetch all users from the server
    const res = await axios.get(BASE_URL + "/group/allUsers");

    //Extract the users array from the server response
    const { users } = res.data;
    usersList.innerHTML = "";

    // Iterate through each user and dynamically append HTML elements to the users list
    for (const user of users) {
      usersList.innerHTML += `<div
      class="flex items-center justify-between py-2 px-3 bg-gray-700 rounded-md"
    >
      <div>
        <p class="text-sm font-medium text-white">${user.name}</p>
        <p class="text-xs text-gray-500">
          ${user.email}
        </p>
      </div>
      <div class="flex items-center space-x-2">
        <label for="user${user.id}-add" class="flex items-center">
          <input
            type="checkbox"
            id="user-add${user.id}"
            name="user-add${user.id}"
            class="form-checkbox"
            value="${user.id}"
            onchange="let admin = this.parentElement.nextElementSibling.firstElementChild; admin.disabled = !admin.disabled"
          />
          <span class="ml-2 text-sm text-gray-400">Add</span>
        </label>
        <label for="user-admin${user.id}" class="flex items-center">
          <input
            type="checkbox"
            id="user-admin${user.id}"
            name="user-admin${user.id}"
            value="${user.id}"
            class="form-checkbox"
            disabled
          />
          <span class="ml-2 text-sm text-gray-400">Admin</span>
        </label>
      </div>
    </div>`;
    }
  } catch (err) {
    console.error(err);
  }
}

//Event listener for the (Create group) button, triggers the submission of new group data
document
  .getElementById("createGroup")
  .addEventListener("click", submitNewGroupData);

// Event listener for key events, clear new and update group forms on (Escape) or (Space) key press
onkeyup = (e) => {
  if (e.key === "Escape") {
    clearNewGroupForm();
    clearUpdateGroupForm();
  }
  if (e.key === "Space") {
    clearNewGroupForm();
    clearUpdateGroupForm();
  }
};

// Event listener for key press inside the modal, triggers new group data submission on (Enter) key press
document.getElementById("modal").addEventListener("keypress", (e) => {
  if (e.key === "Enter") submitNewGroupData();
});

/**
 * Asynchronously appends administrative tools to the group name display if the current user is an admin of the group.
 * @param {string} groupName - The name of the current group.
 */
async function appendAdminTools(groupName) {
  try {
    // Make an asynchronous HTTP GET request to check if the current user is an admin of the group
    const res = await axios.get(BASE_URL + "/group/isAdmin", {
      headers: {
        groupId: GROUP_ID,
      },
    });

    //If the current user is an admin, append the edit button to the group name display
    if (res.data.isAdmin) {
      document.getElementById(
        "groupName"
      ).innerHTML = `<h1 class="title-font sm:text-3xl text-xl font-medium text-white mb-3 pb-3" id="groupName">
      ${document.getElementById("groupName").textContent}
      <button class="ml-2" onclick="showAdminTools(document.getElementById('groupName').textContent.trim())" id="editGroup">
        <ion-icon name="settings-sharp" class="align-middle text-white bg-indigo-500 border-0 py-2 px-4 focus:outline-none hover:bg-indigo-600 rounded text-lg"></ion-icon>
      </button>
    </h1>
      `;
    }
  } catch (err) {
    console.error(err);
  }
}

/**
 * Clears the update group form by resetting the input fields and hiding the form modal.
 */
function clearUpdateGroupForm() {
  const modal = document.getElementById("adminModal");
  const groupNameField = document.getElementById("group-name-admin");
  const usersList = document.getElementById("usersListAdmin");

  //Clear input fields
  usersList.innerHTML = "";
  groupNameField.value = "";

  //Hide the form modal if it is not already hidden
  if (modal.classList.contains("-z-10")) return;

  modal.classList.toggle("z-10");
  modal.classList.toggle("-z-10");
}

/**
 * Asynchronously displays the administrative tools for managing group participants.
 * @param {string} groupName - The name of the current group.
 */
async function showAdminTools(groupName) {
  try {
    const adminModal = document.getElementById("adminModal");
    const groupNameField = document.getElementById("group-name-admin");

    // Display the current participants and show form modal
    await showCurrentParticipants();
    groupNameField.value = groupName;
    adminModal.classList.toggle("-z-10");
    adminModal.classList.toggle("z-10");

    //Set focus to the close button
    document.getElementById("closeAdminForm").focus();
  } catch (err) {
    console.error(err);
  }
}

/**
 * Asynchronously displays the current participants in the administrative form for updating group details.
 */
async function showCurrentParticipants() {
  try {
    const usersList = document.getElementById("usersListAdmin");

    // Make an asynchronous HTTP GET request to fetch current participants of the group
    const res = await axios.get(BASE_URL + "/group/currentUsers", {
      headers: {
        groupId: GROUP_ID,
      },
    });

    // Extract data from the server response
    const { users, participants, admins } = res.data;

    //Create sets for efficient checking of admin and participant status
    const adminIds = new Set(admins.map((admin) => admin.id));
    const participantIds = new Set(
      participants.map((participant) => participant.id)
    );

    //clear existing content in the participants list container
    usersList.innerHTML = "";

    // Iterate through each user and dynamically append HTML elements to the participants list
    for (const user of users) {
      usersList.innerHTML += `<div
      class="flex items-center justify-between py-2 px-3 bg-gray-700 rounded-md"
    >
      <div class="flex-grow">
        <p class="text-sm font-medium text-white">${user.name}</p>
        <p class="text-xs text-gray-500">
          ${user.email}
        </p>
      </div>
      <div class="flex items-center space-x-2">
        <label for="user${user.id}-add" class="flex items-center">
          <input
            type="checkbox"
            id="update-user-add${user.id}"
            name="update-user-add${user.id}"
            class="form-checkbox"
            value="${user.id}"
            onchange="let admin = this.parentElement.nextElementSibling.firstElementChild; admin.disabled = !admin.disabled"
          />
          <span class="ml-2 text-sm text-gray-400">Add</span>
        </label>
        <label for="user-admin${user.id}" class="flex items-center">
          <input
            type="checkbox"
            id="update-user-admin${user.id}"
            name="update-user-admin${user.id}"
            value="${user.id}"
            class="form-checkbox"
            disabled
          />
          <span class="ml-2 text-sm text-gray-400">Admin</span>
        </label>
      </div>
    </div>`;
    }

    // Check chechboxes based on admin and participant status
    for (const listItem of usersList.childNodes) {
      const participantCheckbox =
        listItem.lastElementChild.firstElementChild.firstElementChild;
      const adminCheckbox =
        listItem.lastElementChild.lastElementChild.firstElementChild;

      const id = participantCheckbox.value;

      if (participantIds.has(parseInt(id))) {
        participantCheckbox.click();
        if (adminIds.has(parseInt(id))) {
          adminCheckbox.click();
        }
      } else {
        console.log(Array.from(participantIds), id);
      }
    }
  } catch (err) {
    console.error(err);
  }
}

// Event listener for the (Update group) button, triggers the submission of the updated group data
document.getElementById("updateGroup").addEventListener("click", async () => {
  const groupNameField = document.getElementById("group-name-admin");
  try {
    // Select all checkboxes related to adding and assigning admin roles
    const addCheckboxes = document.querySelectorAll(
      'input[name^="update-user-add"]'
    );
    const adminCheckboxes = document.querySelectorAll(
      'input[name^="update-user-admin"]'
    );

    //Validate the number of checkboxes
    if (addCheckboxes.length != adminCheckboxes.length)
      throw new Error("Error!");

    //Extract the group name from the input field
    const groupName = groupNameField.value;

    // Validate the group name length
    if (groupName.length < 1 || groupName.length > 30) {
      groupNameField.value = "";
      groupNameField.classList.toggle("placeholder-red-600");
      groupNameField.setAttribute(
        "placeholder",
        "Enter a name 1 - 30 characters long."
      );
      setTimeout(() => {
        groupNameField.classList.toggle("placeholder-red-600");
        groupNameField.setAttribute("placeholder", "");
      }, 3000);
      throw new Error("Invalid group name!");
    }

    // Array to store selected participants and admins
    const participants = [];
    const admins = [];

    // Iterate through checkboxes to identify selected participants and admins
    for (let i = 0; i < addCheckboxes.length; i++) {
      if (addCheckboxes[i].checked) {
        participants.push(addCheckboxes[i].value);
        if (adminCheckboxes[i].checked) admins.push(adminCheckboxes[i].value);
      }
    }

    // Make an asynchronous HTTP PUT request to update group details
    const res = await axios.put(BASE_URL + "/group/update", {
      groupName,
      participants,
      admins,
      groupId: GROUP_ID,
    });

    // Extract the updated group ID from the server response
    const groupId = res.data.id;

    // Clear the update group form and display the updated group
    clearUpdateGroupForm();
    showGroupsButton.click();
    GROUP_ID = groupId;
    loadGroup({ lastElementChild: { textContent: groupName } }, groupId);
  } catch (err) {
    // Handle errors related to group name validation and submission
    groupNameField.value = "";
    groupNameField.classList.toggle("placeholder-red-600");
    groupNameField.setAttribute(
      "placeholder",
      "Something went wrong, please try again later."
    );
    setTimeout(() => {
      groupNameField.classList.toggle("placeholder-red-600");
      groupNameField.setAttribute("placeholder", "");
      clearNewGroupForm();
    }, 3000);
    console.error(err);
  }
});

/**
 * Asynchronously deletes the currently selected group and updates the UI accordingly.
 */
async function deleteGroup() {
  try {
    // Make an asynchronous HTTP PUT request to delete the current group
    await axios.put(BASE_URL + "/group/delete", { groupId: GROUP_ID });
    clearUpdateGroupForm();
    showGroupsButton.click();
    loadGroup(null, 0);
  } catch (err) {
    console.error(err);
  }
}

/***********IMAGE HANDLERS************/

/**
 * Handles the change event of the file input element and updates the UI accordingly.
 * @param {Event} event - The change event object.
 */
function handleFileInputChange(event) {
  const fileInput = event.target;
  const selectedFileName = document.getElementById("selectedFileName");
  const discardImage = document.getElementById("discardImage");

  //Get the selected file from the input
  const file = fileInput.files[0];

  //If a file is selected, display it's name and discard option
  if (file) {
    document.getElementById("selectedFileContainer").classList.toggle("hidden");
    selectedFileName.textContent = file.name;
    discardImage.style.display = "inline";
  } else {
    selectedFileName.textContent = "";
    discardImage.style.display = "none";
  }
}

/**
 * Discards the selected image by resetting the file input and updating the UI accordingly.
 */
function discardSelectedImage() {
  const fileInput = document.getElementById("fileInput");
  const selectedFileName = document.getElementById("selectedFileName");
  const discardImage = document.getElementById("discardImage");

  //Reset the file input and clear the displayed file name and discard option
  fileInput.value = "";
  selectedFileName.textContent = "";
  discardImage.style.display = "none";
  document.getElementById("selectedFileContainer").classList.toggle("hidden");
}
