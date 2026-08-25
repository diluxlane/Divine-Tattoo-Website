import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/* ==========================================================
   DIVINE TATTOO — ADMIN LOGIN
   Supabase authentication
   ========================================================== */

const SUPABASE_URL =
  "https://igjsnwpcyjgjjhpmpkvi.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_NJdvsjVqLBXDkRyJhKp-WA_-M-w0UEX";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);


/* ==========================================================
   ELEMENTS
   ========================================================== */

const loginForm =
  document.getElementById("loginForm");

const emailInput =
  document.getElementById("email");

const passwordInput =
  document.getElementById("password");

const loginButton =
  document.getElementById("loginButton");

const loginMessage =
  document.getElementById("loginMessage");


/* ==========================================================
   MESSAGE
   ========================================================== */

function showMessage(message) {
  loginMessage.textContent = message;
}


/* ==========================================================
   BUTTON STATE
   ========================================================== */

function setLoading(isLoading) {
  loginButton.disabled = isLoading;

  const buttonText =
    loginButton.querySelector(".button-text");

  if (!buttonText) {
    return;
  }

  buttonText.textContent =
    isLoading
      ? "Signing In..."
      : "Sign In";
}


/* ==========================================================
   CHECK EXISTING SESSION
   ========================================================== */

async function checkExistingSession() {

  const {
    data: {
      session
    },
    error
  } = await supabase.auth.getSession();


  if (error) {

    console.error(
      "Session check error:",
      error
    );

    return;
  }


  if (session) {

    window.location.replace(
      "./dashboard.html"
    );

  }
}


/* ==========================================================
   LOGIN
   ========================================================== */

loginForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    showMessage("");


    const email =
      emailInput.value.trim();

    const password =
      passwordInput.value;


    if (!email) {

      showMessage(
        "Please enter your email."
      );

      emailInput.focus();

      return;
    }


    if (!password) {

      showMessage(
        "Please enter your password."
      );

      passwordInput.focus();

      return;
    }


    setLoading(true);


    try {

      const {
        data,
        error
      } =
        await supabase.auth.signInWithPassword({
          email,
          password
        });


      if (error) {

        console.error(
          "Login error:",
          error
        );

        showMessage(
          "Invalid email or password."
        );

        return;
      }


      if (!data.session) {

        showMessage(
          "Login failed. No session was created."
        );

        return;
      }


      window.location.replace(
        "./dashboard.html"
      );


    } catch (error) {

      console.error(
        "Unexpected login error:",
        error
      );

      showMessage(
        "Something went wrong. Please try again."
      );


    } finally {

      setLoading(false);

    }

  }
);


/* ==========================================================
   START
   ========================================================== */

checkExistingSession();