import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://igjsnwpcyjgjjhpmpkvi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_NJdvsjVqLBXDkRyJhKp-WA_-M-w0UEX";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const loginForm = document.getElementById("loginForm");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");

function showMessage(message) {
  loginMessage.textContent = message;
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    showMessage("Please enter your email and password.");
    return;
  }

  loginButton.disabled = true;
  loginButton.textContent = "Signing In...";
  showMessage("");

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Login error:", error);
    showMessage("Invalid email or password.");
    loginButton.disabled = false;
    loginButton.textContent = "Sign In";
    return;
  }

  if (!data.session) {
    showMessage("Login could not be completed.");
    loginButton.disabled = false;
    loginButton.textContent = "Sign In";
    return;
  }

  window.location.href = "dashboard.html";
});
