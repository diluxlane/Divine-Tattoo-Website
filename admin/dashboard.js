import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL =
  "https://igjsnwpcyjgjjhpmpkvi.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_NJdvsjVqLBXDkRyJhKp-WA_-M-w0UEX";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const portfolioGrid =
  document.getElementById("portfolioGrid");

const portfolioMessage =
  document.getElementById("portfolioMessage");

const imageInput =
  document.getElementById("imageInput");

const uploadButton =
  document.getElementById("uploadButton");

const uploadMessage =
  document.getElementById("uploadMessage");

const logoutButton =
  document.getElementById("logoutButton");

let currentUser = null;
let portfolioItems = [];


// =====================================================
// AUTHENTICATION
// =====================================================

async function requireUser() {

  const {
    data: {
      session
    },
    error
  } = await supabase.auth.getSession();

  if (
    error ||
    !session
  ) {
    window.location.replace("./");
    return null;
  }

  const {
    data: {
      user
    },
    error: userError
  } = await supabase.auth.getUser();

  if (
    userError ||
    !user
  ) {
    window.location.replace("./");
    return null;
  }

  return user;
}


// =====================================================
// LOGOUT
// =====================================================

logoutButton.addEventListener(
  "click",
  async () => {

    await supabase.auth.signOut();

    window.location.replace("./");
  }
);


// =====================================================
// LOAD PORTFOLIO
// =====================================================

async function loadPortfolio() {

  portfolioMessage.textContent =
    "Loading portfolio...";

  portfolioGrid.innerHTML = "";


  const {
    data,
    error
  } =
    await supabase
      .from("portfolio")
      .select(
        "idid, owner_id, image_path, published, display_order, created_at"
      )
      .eq(
        "owner_id",
        currentUser.id
      )
      .order(
        "display_order",
        {
          ascending: true
        }
      )
      .order(
        "created_at",
        {
          ascending: true
        }
      );


  if (error) {

    console.error(
      "Portfolio error:",
      error
    );

    portfolioMessage.textContent =
      "Unable to load portfolio.";

    return;
  }


  portfolioItems =
    data || [];


  if (
    portfolioItems.length === 0
  ) {

    portfolioMessage.textContent =
      "No portfolio images yet.";

    return;
  }


  portfolioMessage.textContent = "";

  await renderPortfolio();
}


// =====================================================
// RENDER PORTFOLIO
// =====================================================

async function renderPortfolio() {

  portfolioGrid.innerHTML = "";


  for (
    let index = 0;
    index < portfolioItems.length;
    index++
  ) {

    const item =
      portfolioItems[index];


    const card =
      document.createElement(
        "article"
      );

    card.className =
      "portfolio-card";

    card.draggable = true;

    card.dataset.id =
      item.idid;


    // -----------------------------------------------
    // Drag events
    // -----------------------------------------------

    card.addEventListener(
      "dragstart",
      handleDragStart
    );

    card.addEventListener(
      "dragover",
      handleDragOver
    );

    card.addEventListener(
      "drop",
      handleDrop
    );

    card.addEventListener(
      "dragend",
      handleDragEnd
    );


    // -----------------------------------------------
    // Signed image URL
    // -----------------------------------------------

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


    if (
      signedError
    ) {

      console.error(
        "Image URL error:",
        signedError
      );

      continue;
    }


    // -----------------------------------------------
    // Image
    // -----------------------------------------------

    const image =
      document.createElement(
        "img"
      );

    image.src =
      signedData.signedUrl;

    image.alt =
      `Portfolio image ${index + 1}`;

    image.loading =
      "lazy";

    image.className =
      "portfolio-preview";


    // -----------------------------------------------
    // Card content
    // -----------------------------------------------

    const info =
      document.createElement(
        "div"
      );

    info.className =
      "portfolio-info";


    const order =
      document.createElement(
        "div"
      );

    order.className =
      "portfolio-order";

    order.textContent =
      `#${index + 1}`;


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


    const controls =
      document.createElement(
        "div"
      );

    controls.className =
      "portfolio-controls";


    // -----------------------------------------------
    // Publish button
    // -----------------------------------------------

    const publishButton =
      document.createElement(
        "button"
      );

    publishButton.type =
      "button";

    publishButton.className =
      "publish-button";

    publishButton.textContent =
      item.published
        ? "Unpublish"
        : "Publish";


    publishButton.addEventListener(
      "click",
      () =>
        togglePublished(
          item,
          publishButton,
          status
        )
    );


    // -----------------------------------------------
    // Delete button
    // -----------------------------------------------

    const deleteButton =
      document.createElement(
        "button"
      );

    deleteButton.type =
      "button";

    deleteButton.className =
      "delete-button";

    deleteButton.textContent =
      "Delete";


    deleteButton.addEventListener(
      "click",
      () =>
        deletePortfolioItem(
          item,
          deleteButton
        )
    );


    controls.appendChild(
      publishButton
    );

    controls.appendChild(
      deleteButton
    );


    info.appendChild(
      order
    );

    info.appendChild(
      status
    );

    info.appendChild(
      controls
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


// =====================================================
// PUBLISH / UNPUBLISH
// =====================================================

async function togglePublished(
  item,
  button,
  status
) {

  button.disabled = true;


  const newValue =
    !item.published;


  const {
    data,
    error
  } =
    await supabase
      .from("portfolio")
      .update({
        published:
          newValue
      })
      .eq(
        "idid",
        item.idid
      )
      .eq(
        "owner_id",
        currentUser.id
      )
      .select()
      .single();


  if (error) {

    console.error(
      "Publish update error:",
      error
    );

    alert(
      "Unable to update publication status."
    );

    button.disabled = false;

    return;
  }


  item.published =
    data.published;


  status.textContent =
    item.published
      ? "Published"
      : "Unpublished";


  button.textContent =
    item.published
      ? "Unpublish"
      : "Publish";


  button.disabled = false;
}


// =====================================================
// DELETE
// =====================================================

async function deletePortfolioItem(
  item,
  button
) {

  const confirmed =
    window.confirm(
      "Delete this portfolio image permanently?"
    );


  if (!confirmed) {
    return;
  }


  button.disabled = true;

  button.textContent =
    "Deleting...";


  try {

    // Delete Storage object.

    const {
      error: storageError
    } =
      await supabase.storage
        .from("portfolio")
        .remove([
          item.image_path
        ]);


    if (
      storageError
    ) {
      throw storageError;
    }


    // Delete database record.

    const {
      error: databaseError
    } =
      await supabase
        .from("portfolio")
        .delete()
        .eq(
          "idid",
          item.idid
        )
        .eq(
          "owner_id",
          currentUser.id
        );


    if (
      databaseError
    ) {
      throw databaseError;
    }


    await loadPortfolio();

  } catch (error) {

    console.error(
      "Delete error:",
      error
    );

    alert(
      error.message ||
      "Unable to delete image."
    );

    button.disabled = false;

    button.textContent =
      "Delete";
  }
}


// =====================================================
// DRAG AND DROP
// =====================================================

let draggedId = null;


function handleDragStart(event) {

  draggedId =
    event.currentTarget.dataset.id;

  event.currentTarget.classList.add(
    "dragging"
  );

  event.dataTransfer.effectAllowed =
    "move";
}


function handleDragOver(event) {

  event.preventDefault();

  event.dataTransfer.dropEffect =
    "move";
}


function handleDrop(event) {

  event.preventDefault();

  const targetCard =
    event.currentTarget;

  const targetId =
    targetCard.dataset.id;


  if (
    !draggedId ||
    draggedId === targetId
  ) {
    return;
  }


  const fromIndex =
    portfolioItems.findIndex(
      item =>
        item.idid === draggedId
    );


  const toIndex =
    portfolioItems.findIndex(
      item =>
        item.idid === targetId
    );


  if (
    fromIndex === -1 ||
    toIndex === -1
  ) {
    return;
  }


  const movedItem =
    portfolioItems.splice(
      fromIndex,
      1
    )[0];


  portfolioItems.splice(
    toIndex,
    0,
    movedItem
  );


  renderPortfolio();

  saveOrder();
}


function handleDragEnd(event) {

  event.currentTarget.classList.remove(
    "dragging"
  );

  draggedId = null;
}


// =====================================================
// SAVE ORDER
// =====================================================

async function saveOrder() {

  portfolioMessage.textContent =
    "Saving order...";


  try {

    for (
      let index = 0;
      index < portfolioItems.length;
      index++
    ) {

      const item =
        portfolioItems[index];


      const {
        error
      } =
        await supabase
          .from("portfolio")
          .update({
            display_order:
              index + 1
          })
          .eq(
            "idid",
            item.idid
          )
          .eq(
            "owner_id",
            currentUser.id
          );


      if (error) {
        throw error;
      }


      item.display_order =
        index + 1;
    }


    portfolioMessage.textContent =
      "Order saved.";

    setTimeout(
      () => {

        if (
          portfolioItems.length > 0
        ) {
          portfolioMessage.textContent =
            "";
        }

      },
      1500
    );

  } catch (error) {

    console.error(
      "Order save error:",
      error
    );

    portfolioMessage.textContent =
      "Unable to save order.";

    await loadPortfolio();
  }
}


// =====================================================
// UPLOAD MULTIPLE IMAGES
// =====================================================

uploadButton.addEventListener(
  "click",
  uploadImages
);


async function uploadImages() {

  const files =
    Array.from(
      imageInput.files
    );


  if (
    files.length === 0
  ) {

    uploadMessage.textContent =
      "Please select one or more images.";

    return;
  }


  uploadButton.disabled = true;

  uploadButton.textContent =
    "Uploading...";

  uploadMessage.textContent =
    "";


  let successful =
    0;


  try {

    for (
      const file of files
    ) {

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

        console.warn(
          "Skipped unsupported file:",
          file.name
        );

        continue;
      }


      if (
        file.size >
        5 * 1024 * 1024
      ) {

        console.warn(
          "Skipped file over 5 MB:",
          file.name
        );

        continue;
      }


      const extension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase() ||
        "jpg";


      const fileName =
        `${crypto.randomUUID()}.${extension}`;


      const filePath =
        `${currentUser.id}/${fileName}`;


      // Upload file.

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


      if (
        storageError
      ) {
        throw storageError;
      }


      // Insert database record.
      // display_order is automatically
      // assigned by the database trigger.

      const {
        error: databaseError
      } =
        await supabase
          .from("portfolio")
          .insert({
            owner_id:
              currentUser.id,

            image_path:
              filePath,

            published:
              true
          });


      if (
        databaseError
      ) {

        // Clean up orphaned Storage file.

        await supabase.storage
          .from("portfolio")
          .remove([
            filePath
          ]);

        throw databaseError;
      }


      successful++;
    }


    imageInput.value = "";


    uploadMessage.textContent =
      `${successful} image${
        successful === 1
          ? ""
          : "s"
      } uploaded successfully.`;


    await loadPortfolio();

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
      "Upload Images";
  }
}


// =====================================================
// INITIALIZE
// =====================================================

currentUser =
  await requireUser();


if (currentUser) {

  await loadPortfolio();

  document.body.classList.remove(
    "auth-checking"
  );
}