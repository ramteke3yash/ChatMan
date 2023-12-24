const host = window.location.protocol + "//" + window.location.host;

const emailRegExp = /^(?!\s)[\w.-]{1,28}@[a-zA-Z_-]+?(?:\.[a-zA-Z]{2,})+$/;
const passwordRegExp = /^(?=.*[A-Z])(?=.*[\W_]).{8,}$/;

const authWarning = document.getElementById("auth-warning");

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
  const email = document
    .getElementById("email")
    .value.trim()
    .replace(/\s+/g, " ");
  const password = document.getElementById("password").value;

  if (!emailRegExp.test(email) || !passwordRegExp.test(password)) {
    authWarning.style.display = "block";
    setTimeout(() => {
      authWarning.style.display = "none";
    }, 4000);
  } else {
    await loginUser();
  }
}

async function loginUser() {
  try {
    const res = await axios.post(host + "/login", {
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
    });
    if (res.status === 201) {
      window.location = res.data.redirect;
    } else if (res.status === 200) {
      authWarning.style.display = "block";
      setTimeout(() => {
        authWarning.style.display = "none";
      }, 4000);
    }
  } catch (err) {
    console.error("Something went wrong!");
  }
}
