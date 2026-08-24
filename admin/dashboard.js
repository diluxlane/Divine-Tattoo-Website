import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://igjsnwpcyjgjjhpmpkvi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_NJdvsjVqLBXDkRyJhKp-WA_-M-w0UEX";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const logoutButton = document.getElementById("logoutButton");
const uploadButton = document.getElementById("uploadButton");
const imageInput = document.getElementById("imageInput");
const uploadMessage = document.getElementById("uploadMessage");
const portfolioGrid = document.getElementById("portfolioGrid");
const portfolioMessage = document.getElementById("portfolioMessage");

async function requireAuthentication() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    window.location.replace("./");
    return null;
  }

  return session;
}

async function logout() {
  logoutButton.disabled = true;
  logoutButton.textContent = "Signing Out...";

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Logout error:", error);

    logoutButton.disabled = false;
    logoutButton.textContent = "Sign Out";
    return;
  }

  window.location.replace("./");
}

async function uploadImage() {
  const file = imageInput.files[0];

  if (!file) {
    uploadMessage.textContent = "Please select an image first.";
    return;
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.type)) {
    uploadMessage.textContent =
      "Only JPG, PNG, and WebP images are allowed.";
    return;
  }

  const maxSize = 5 * 1024 * 1024;

  if (file.size > maxSize) {
    uploadMessage.textContent =
      "Image must be smaller than 5 MB.";
    return;
  }

  uploadButton.disabled = true;
  uploadButton.textContent = "Uploading...";
  uploadMessage.textContent = "";

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Authentication session expired.");
    }

    const extension =
      file.name.split(".").pop()?.toLowerCase() || "jpg";

    const fileName =
      `${crypto.randomUUID()}.${extension}`;

    const filePath =
      `${user.id}/${fileName}`;

    const { error: storageError } =
      await supabase.storage
        .from("portfolio")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

    if (storageError) {
      throw storageError;
    }

    const { error: databaseError } =
      await supabase
        .from("portfolio")
        .insert({
          owner_id: user.id,
          image_path: filePath,
          published: true,
        });

    if (databaseError) {
      await supabase.storage
        .from("portfolio")
        .remove([filePath]);

      throw databaseError;
    }

    imageInput.value = "";

    uploadMessage.textContent =
      "Image uploaded successfully.";

    await loadPortfolio();

  } catch (error) {
    console.error("Upload error:", error);

    uploadMessage.textContent =
      error.message || "Upload failed.";
  } finally {
    uploadButton.disabled = false;
    uploadButton.textContent = "Upload Image";
  }
}

async function loadPortfolio() {
  portfolioMessage.textContent = "Loading...";
  portfolioGrid.innerHTML = "";

  const {
    data,
    error,
  } = await supabase
    .from("portfolio")
    .select("idid, image_path, published, created_at")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error("Portfolio load error:", error);

    portfolioMessage.textContent =
      "Unable to load portfolio.";
    return;
  }

  if (!data || data.length === 0) {
    portfolioMessage.textContent =
      "No portfolio images yet.";
    return;
  }

  portfolioMessage.textContent = "";

  for (const item of data) {
    const card = document.createElement("article");

    card.className = "portfolio-card";

    const image = document.createElement("div");

    image.className = "portfolio-image";

    image.textContent = "Image";

    card.appendChild(image);

    portfolioGrid.appendChild(card);
  }
}

logoutButton.addEventListener(
  "click",
  logout
);

uploadButton.addEventListener(
  "click",
  uploadImage
);

const session = await requireAuthentication();

if (session) {
  await loadPortfolio();
}
