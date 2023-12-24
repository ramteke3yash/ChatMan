const host = window.location.protocol + "//" + window.location.host;

const nameRegExp = /^(?=.{1,40}$)[a-zA-Z]+(?:\s[a-zA-Z]+)*$/;
const emailRegExp = /^(?!\s)[\w.-]{1,28}@[a-zA-Z_-]+?(?:\.[a-zA-Z]{2,})+$/;
const passwordRegExp = /^(?=.*[A-Z])(?=.*[\W_]).{8,}$/;

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

async function init() {
  const name = document
    .getElementById("name")
    .value.trim()
    .replace(/\s+/g, " ");
  const email = document
    .getElementById("email")
    .value.trim()
    .replace(/\s+/g, " ");
  const password = document.getElementById("password").value;

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
    nameWarning.style.display = "none";
    emailWarning.style.display = "none";
    passwordWarning.style.display = "none";
    await registerUser();
  }
}

async function registerUser() {
  try {
    const res = await axios.post(host + "/signup", {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
    });
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
