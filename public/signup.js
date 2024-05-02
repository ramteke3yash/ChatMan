// Base URL of the current web page
const host = window.location.protocol + "//" + window.location.host;

// Regular exressions for input validation
const nameRegExp = /^(?=.{1,40}$)[a-zA-Z]+(?:\s[a-zA-Z]+)*$/;
const emailRegExp = /^(?!\s)[\w.-]{1,28}@[a-zA-Z_-]+?(?:\.[a-zA-Z]{2,})+$/;
const passwordRegExp = /^(?=.*[A-Z])(?=.*[\W_]).{8,}$/;

// Warning elements
const nameWarning = document.getElementById("name-warning");
const emailWarning = document.getElementById("email-warning");
const passwordWarning = document.getElementById("password-warning");
const duplicateWarning = document.getElementById("duplicate-warning");

document.getElementById("signup").addEventListener("click", init);
window.addEventListener(
  "keypress",
  async (e) => {
    if (e.key === "Enter") {
      await init();
    }
  },
  true
);

/**
 * Initialization function for user registration.
 */
async function init() {
  // Get input values for name, email and password
  const name = document
    .getElementById("name")
    .value.trim()
    .replace(/\s+/g, " ");
  const email = document
    .getElementById("email")
    .value.trim()
    .replace(/\s+/g, " ");
  const password = document.getElementById("password").value;

  // Validate input and display appropriate warnings
  if (!nameRegExp.test(name)) {
    nameWarning.style.display = "block";
  } else if (!emailRegExp.test(email)) {
    nameWarning.style.display = "none";
    emailWarning.style.display = "block";
  } else if (!passwordRegExp.test(password)) {
    nameWarning.style.display = "none";
    emailWarning.style.display = "none";
    passwordWarning.style.display = "block";
  } else {
    // if input is valid, clear warnings and proceed to user registration
    nameWarning.style.display = "none";
    emailWarning.style.display = "none";
    passwordWarning.style.display = "none";
    await registerUser();
  }
}

/**
 * User registration function.
 * Sends user registration data to the server.
 */
async function registerUser() {
  try {
    // Send a POST request to the server with user registration data
    const res = await axios.post(host + "/signup", {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
    });

    // Check server response status and redirect or display duplicate warning
    if (res.status === 201) {
      window.location = res.data.redirect;
    } else if (res.status === 200) {
      duplicateWarning.style.display = "block";
      setTimeout(() => {
        duplicateWarning.style.display = "none";
      }, 4000);
    }
  } catch (err) {
    console.error("Something went wrong!");
  }
}
