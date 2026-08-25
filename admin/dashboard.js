import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL =
  "https://igjsnwpcyjgjjhpmpkvi.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_NJdvsjVqLBXDkRyJhKp-WA_-M-w0UEX";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);


// =========================
// ELEMENTS
// =========================

const logoutButton =
  document.getElementById("logoutButton");

const uploadButton =
  document.getElementById("uploadButton");

const imageInput =
  document.getElementById("imageInput");

const uploadMessage =
  document.getElementById("uploadMessage");

const portfolioGrid =
  document.getElementById("portfolioGrid");

const portfolioMessage =
  document.getElementById("portfolioMessage");


// =========================
// AUTHENTICATION
// =========================

async function getAuthenticatedUser() {

  const {
    data: { session },
    error
  } = await supabase.auth.getSession();

  if (error) {
    console.error(
      "Session error:",
      error
    );

    window.location.replace("./");

    return null;
  }

  if (!session) {
    window.location.replace("./");

    return null;
  }

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    window.location.replace("./");

    return null;
  }

  document.body.classList.remove(
    "auth-checking"
  );

  return user;
}


// =========================
// LOGOUT
// =========================

async function logout() {

  logoutButton.disabled = true;

  logoutButton.textContent =
    "Signing Out...";

  const {
    error
  } = await supabase.auth.signOut();

  if (error) {

    console.error(
      "Logout error:",
      error
    );

    logoutButton.disabled = false;

    logoutButton.textContent =
      "Sign Out";

    return;
  }

  window.location.replace("./");
}


// =========================
// LOAD PORTFOLIO
// =========================

async function loadPortfolio(user) {

  portfolioMessage.textContent =
    "Loading portfolio...";

  portfolioGrid.innerHTML = "";


  // IMPORTANT:
  // Only request records belonging
  // to the authenticated user.

  const {
    data,
    error
  } = await supabase
    .from("portfolio")
    .select(
      "idid, image_path, published, created_at"
    )
    .eq(
      "owner_id",
      user.id
    )
    .order(
      "created_at",
      {
        ascending: false
      }
    );


  if (error) {

    console.error(
      "Portfolio load error:",
      error
    );

    portfolioMessage.textContent =
      "Unable to load portfolio.";

    return;
  }


  if (
    !data ||
    data.length === 0
  ) {

    portfolioMessage.textContent =
      "No portfolio images yet.";

    return;
  }


  portfolioMessage.textContent = "";


  // Create a temporary signed URL
  // for each private Storage object.

  for (const item of data) {

    const {
      data: signedData,
      error: signedError
    } =
      await supabase.storage
        .from("portfolio")
        .createSignedUrl(
          item.image_path,
          3600
        );


    if (signedError) {

      console.error(
        "Signed URL error:",
        signedError
      );

      continue;
    }


    const card =
      document.createElement(
        "article"
      );

    card.className =
      "portfolio-card";


    const image =
      document.createElement(
        "img"
      );

    image.src =
      signedData.signedUrl;

    image.alt =
      "Portfolio tattoo";

    image.loading =
      "lazy";

    image.className =
      "portfolio-preview";


    const info =
      document.createElement(
        "div"
      );

    info.className =
      "portfolio-info";


    const status =
      document.createElement(
        "span"
      );

    status.className =
      "portfolio-status";

    status.textContent =
      item.published
        ? "Published"
        : "Unpublished";


    info.appendChild(
      status
    );

    card.appendChild(
      image
    );

    card.appendChild(
      info
    );

    portfolioGrid.appendChild(
      card
    );
  }
}


// =========================
// UPLOAD
// =========================

async function uploadImage(user) {

  const file =
    imageInput.files[0];


  if (!file) {

    uploadMessage.textContent =
      "Please select an image first.";

    return;
  }


  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];


  if (
    !allowedTypes.includes(
      file.type
    )
  ) {

    uploadMessage.textContent =
      "Only JPG, PNG, and WebP images are allowed.";

    return;
  }


  const maxSize =
    5 * 1024 * 1024;


  if (
    file.size > maxSize
  ) {

    uploadMessage.textContent =
      "Image must be smaller than 5 MB.";

    return;
  }


  uploadButton.disabled = true;

  uploadButton.textContent =
    "Uploading...";

  uploadMessage.textContent = "";


  try {

    const extension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase() ||
      "jpg";


    const fileName =
      `${crypto.randomUUID()}.${extension}`;


    const filePath =
      `${user.id}/${fileName}`;


    // Upload to private Storage.

    const {
      error: storageError
    } =
      await supabase.storage
        .from("portfolio")
        .upload(
          filePath,
          file,
          {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type
          }
        );


    if (storageError) {
      throw storageError;
    }


    // Create database record.

    const {
      error: databaseError
    } =
      await supabase
        .from("portfolio")
        .insert({

          owner_id:
            user.id,

          image_path:
            filePath,

          published:
            true
        });


    // If database insertion fails,
    // remove the Storage object.

    if (databaseError) {

      await supabase.storage
        .from("portfolio")
        .remove([
          filePath
        ]);

      throw databaseError;
    }


    imageInput.value = "";

    uploadMessage.textContent =
      "Image uploaded successfully.";


    await loadPortfolio(user);


  } catch (error) {

    console.error(
      "Upload error:",
      error
    );

    uploadMessage.textContent =
      error.message ||
      "Upload failed.";

  } finally {

    uploadButton.disabled = false;

    uploadButton.textContent =
      "Upload Image";
  }
}


// =========================
// START
// =========================

const user =
  await getAuthenticatedUser();


if (user) {

  logoutButton.addEventListener(
    "click",
    logout
  );

  uploadButton.addEventListener(
    "click",
    () => uploadImage(user)
  );

  await loadPortfolio(user);
}