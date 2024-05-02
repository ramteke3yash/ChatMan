// Base URL of the current web page
const host = window.location.protocol + "//" + window.location.host;

//Regular expressions for email and password validation
const emailRegExp = /^(?!\s)[\w.-]{1,28}@[a-zA-Z_-]+?(?:\.[a-zA-Z]{2,})+$/;
const passwordRegExp = /^(?=.*[A-Z])(?=.*[\W_]).{8,}$/;

// Element reference for displaying authentication warnings
const authWarning = document.getElementById("auth-warning");

// Event listener for the signup button
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

async function init() {
  // Extract and clean user input for email and password
  const email = document
    .getElementById("email")
    .value.trim()
    .replace(/\s+/g, " ");
  const password = document.getElementById("password").value;

  // Validate email and password using regular expressions
  if (!emailRegExp.test(email) || !passwordRegExp.test(password)) {
    //Display authentication warning for invalid input
    authWarning.style.display = "block";
    setTimeout(() => {
      authWarning.style.display = "none";
    }, 4000);
  } else {
    // proceed to login user if input is valid
    await loginUser();
  }
}

async function loginUser() {
  try {
    // Send a POST request to the login endpoint with user credentials
    const res = await axios.post(host + "/login", {
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
    });
    //Redirect to the provided URL on successful login
    if (res.status === 201) {
      window.location = res.data.redirect;
    } else if (res.status === 200) {
      // Display authentication warning for unsuccessful login
      authWarning.style.display = "block";
      setTimeout(() => {
        authWarning.style.display = "none";
      }, 4000);
    }
  } catch (err) {
    console.error("Something went wrong!");
  }
}
