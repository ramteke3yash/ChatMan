const BASE_URL = "http://localhost:3000";

const socket = io(`${BASE_URL}`);

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

async function loadGroup(element, groupId) {
  try {
    // Check if a default group is selected
    if (groupId === 0) {
      // Update UI elements for the default group
      document.getElementById("groupName").textContent = "ChatMan";
      chatBox.textContent =
        "Please select a group or create one to begin chatting!";
      document.getElementById("ipHandler").style.display = "none";
    } else {
      // Update UI elements for the selected group
      document.getElementById("groupName").textContent =
        element.lastElementChild.textContent;
      chatBox.textContent = "";
      document.getElementById("ipHandler").style.display = "";

      // Scroll to the bottom of the chat box
      chatBox.scrollTop = chatBox.scrollHeight;

      // Update the global group ID
      GROUP_ID = groupId;
      console.log("this gid-->", groupId);

      // Append admin tools and switch to the groups view
      await appendAdminTools();
      showGroupsButton.click();

      // Emit a 'join-room' event to the server
      socket.emit("join-room", groupId, (messages, users) => {
        // Process the messages received from the server if needed
        // For example, you can display the messages in the chat box
        if (messages && messages.length > 0) {
          messages.forEach((message) => {
            showMessage(
              message.message,
              // message.sender ? message.sender.name : "Unknown",
              message.user ? message.user.name : "Unknown",
              message.url,
              message.createdAt
            );
          });
        }
      });
    }
  } catch (error) {
    console.error("Error loading group:", error);
    // Handle the error appropriately, e.g., display an error message to the user
  }
}

function getLocalDateTime(gmtDateTimeString) {
  const gmtDateTime = new Date(gmtDateTimeString);
  return gmtDateTime.toLocaleString(); // Converts both date and time to local time
}

function showMessage(message, name, url, createdAt, userId) {
  const localDateTime = new Date(createdAt).toLocaleString();
  const displayName = name || "Unknown";

  // Initialize an empty string to hold the message content
  let messageContent = "";

  // Include the message in the message content if it's provided
  if (message) {
    messageContent += `<div>${message}</div>`;
  }

  if (url) {
    // Apply Tailwind CSS classes to limit the maximum width of the image
    messageContent += `
      <div class="max-w-md mx-auto">
        <img src="${url}" alt="Image" class="max-w-full h-auto mx-auto" />
      </div>
    `;
  }

  // Only append the message box if message content exists
  if (messageContent.trim() !== "") {
    chatBox.innerHTML += `
      <div class="bg-gray-800 rounded text-start p-4 my-3 mx-3">
        <span class="text-white">${displayName}:&nbsp</span>
        ${messageContent}
        <p class="text-xs text-gray-400 mt-1">${localDateTime}</p>
      </div>
    `;
  }
}

/*****************************BACKEND******************************/

// Listen for incoming chat messages from Socket.io
socket.on("message:recieve-message", (msg) => {
  showMessage(msg.text, msg.name, msg.url, msg.createdAt, msg.userId);
  // Scroll the chat box to the bottom
  chatBox.scrollTop = chatBox.scrollHeight;
});

async function sendMessage() {
  try {
    const messageInput = document.getElementById("message");
    const fileInput = document.getElementById("fileInput");

    const message = messageInput.value;
    const file = fileInput.files[0];

    // Check if only the file is being uploaded
    if (!message && !file) {
      return;
    }

    // Create a FormData object to send the file data
    const formData = new FormData();
    formData.append("file", file);
    formData.append("groupId", GROUP_ID);

    // Use Axios to send a POST request to your server with the FormData for file upload
    const response = await axios.post(
      BASE_URL + "/chat/saveMessage",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    // Handle the response to get the image URL
    const imageUrl = response.data.imageUrl;

    // Emit the message with the image URL to Socket.io clients
    socket.emit("message:send-message", {
      message,
      imageUrl,
      groupId: GROUP_ID,
    });

    // Clear the message input and file input fields
    messageInput.value = "";
    fileInput.value = "";
    document.getElementById("discardImage").click();
  } catch (err) {
    console.error(err);
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
