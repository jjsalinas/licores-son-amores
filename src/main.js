import "./styles.css";
import data from "./data.json";
let spiritsData = [];
let recipesData = [];

async function loadData() {
  try {
    spiritsData = data.spirits.sort((a, b) => a.name > b.name);
    recipesData = data.recipes.sort((a, b) => a.name > b.name);
    renderSpirits();
    enableButtonsLogic();
  } catch (error) {
    console.error("Error cargando datos:", error);
    document.getElementById("spiritsGrid").innerHTML =
      '<p class="no-recipes">Error al cargar los datos. Asegúrate de que data.json está disponible.</p>';
  }
}

function renderSpirits() {
  const grid = document.getElementById("spiritsGrid");
  grid.innerHTML = spiritsData
    .map(
      (spirit, index) => `
        <div class="spirit-card" id="spirit-${index}">
            <input type="checkbox" id="check-${index}">
            <div class="spirit-name">${spirit.name}</div>
            <div class="spirit-brand">${spirit.brand}</div>
            <div class="spirit-type">${spirit.type}</div>
        </div>
    `,
    )
    .join("");
}

function toggleSpirit(index, forcedCheckValue) {
  const card = document.getElementById(`spirit-${index}`);
  const checkbox = document.getElementById(`check-${index}`);
  checkbox.checked =
    forcedCheckValue !== undefined ? forcedCheckValue : !checkbox.checked;
  card.classList.toggle("selected");

  // Update buttons status only on natural toggle
  if (forcedCheckValue === undefined) {
    updateMixButtonStatus();
    updateMassSelectButtonsStatus();
  }
}

function enableButtonsLogic() {
  // Add logic to directly show all cocktails button
  const allRecipesButton = document.getElementById("show-all-recipes-button");
  console.log("allRecipesButton", allRecipesButton);
  if (allRecipesButton) {
    allRecipesButton.disabled = false;
    allRecipesButton.addEventListener("click", (e) => {
      selectAll();
      findRecipes();
    });
  }

  const grid = document.getElementById("spiritsGrid");
  // Add toggle logic to cards
  spiritsData.map((spirit, index) => {
    grid.querySelector(`#spirit-${index}`).addEventListener("click", (e) => {
      toggleSpirit(index);
    });
  });
  // Add recipes crossing to mix button
  const section = document.getElementsByClassName("section");
  if (section && section.length > 0) {
    section[0].querySelector(".mix-button").addEventListener("click", (e) => {
      findRecipes();
    });
    section[0].querySelector(".mix-button").disabled = true;
  }

  // Add logic to select all / none buttons
  if (section && section.length > 0) {
    section[0]
      .querySelector("#select-all-button")
      .addEventListener("click", (e) => {
        selectAll();
      });
    section[0]
      .querySelector("#select-none-button")
      .addEventListener("click", (e) => {
        selectNone();
      });
    updateMassSelectButtonsStatus();
  }
}

function updateMixButtonStatus(forcedDisabledValue) {
  const section = document.getElementsByClassName("section");
  const selected = getSelectedSpiritsTypes();
  if (section && section.length > 0) {
    section[0].querySelector(".mix-button").disabled =
      forcedDisabledValue ?? selected.length === 0;
  }
}

function updateMassSelectButtonsStatus() {
  const section = document.getElementsByClassName("selection-options");
  const selected = getSelectedSpiritsNames();
  if (section && section.length > 0) {
    section[0].querySelector("#select-all-button").disabled =
      selected.length === spiritsData.length;
    section[0].querySelector("#select-none-button").disabled =
      selected.length === 0;
  }
}

function getSelectedSpiritsTypes() {
  const selectedSpirits = [];
  spiritsData.forEach((spirit, index) => {
    const checkbox = document.getElementById(`check-${index}`);
    if (checkbox.checked) {
      selectedSpirits.push(spirit.type);
    }
  });
  return selectedSpirits;
}

function getSelectedSpiritsNames() {
  const selectedSpirits = [];
  spiritsData.forEach((spirit, index) => {
    const checkbox = document.getElementById(`check-${index}`);
    if (checkbox.checked) {
      selectedSpirits.push(spirit.name);
    }
  });
  return selectedSpirits;
}

function selectAll() {
  const selectAllButton = document.getElementById("select-all-button");
  if (selectAllButton) {
    const selectedNames = getSelectedSpiritsNames();
    spiritsData.forEach((spirit, index) => {
      if (!selectedNames.includes(spirit.name)) {
        toggleSpirit(index, true);
      }
    });
  }
  updateMixButtonStatus(false);
  updateMassSelectButtonsStatus();
  return;
}

function selectNone() {
  const selectNoneButton = document.getElementById("select-none-button");
  if (selectNoneButton) {
    const selectedNames = getSelectedSpiritsNames();
    spiritsData.forEach((spirit, index) => {
      if (selectedNames.includes(spirit.name)) {
        toggleSpirit(index, false);
      }
    });
  }
  updateMixButtonStatus(true);
  updateMassSelectButtonsStatus();
  return;
}

function findRecipes() {
  const selectedSpirits = getSelectedSpiritsTypes();
  if (selectedSpirits.length === 0) {
    document.getElementById("recipesContainer").innerHTML =
      '<p class="no-recipes">Por favor, selecciona al menos un licor para encontrar recetas.</p>';
    return;
  }

  const availableRecipes = recipesData.filter((recipe) => {
    const alcoholIngredients = recipe.ingredients.filter(
      (ing) => ing.isAlcohol,
    );
    return alcoholIngredients.every((ingredient) =>
      selectedSpirits.includes(ingredient.type),
    );
  });

  renderRecipes(availableRecipes);

  document.getElementById("recipesContainer").scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function renderRecipes(recipes) {
  const container = document.getElementById("recipesContainer");

  if (recipes.length === 0) {
    container.innerHTML =
      '<p class="no-recipes">No se encontraron recetas con los licores seleccionados. ¡Intenta agregar más licores!</p>';
    return;
  }

  container.innerHTML = recipes
    .map((recipe) => {
      const alcoholIngredients = recipe.ingredients.filter(
        (ing) => ing.isAlcohol,
      );
      const nonAlcoholIngredients = recipe.ingredients.filter(
        (ing) => !ing.isAlcohol,
      );

      return `
            <div class="recipe-card">
            <div class="recipe-content">
                <div class="recipe-name">${recipe.name}</div>
                <div class="non-alcohol-title">Licores:</div>
                <div class="recipe-ingredients">
                    ${alcoholIngredients
                      .map(
                        (ing) => `
                        <div class="ingredient alcohol-ingredient">
                            <span class="ingredient-amount">${ing.amount}</span>
                            <span>${ing.name}</span>
                        </div>
                    `,
                      )
                      .join("")}
                    ${
                      nonAlcoholIngredients.length > 0
                        ? `
                        <div class="non-alcohol-section">
                            <div class="non-alcohol-title">Otros ingredientes:</div>
                            ${nonAlcoholIngredients
                              .map(
                                (ing) => `
                                <div class="ingredient non-alcohol-ingredient">
                                    ${ing.amount ? `<span class="ingredient-amount">${ing.amount}</span>` : ""}
                                    <span>${ing.name}</span>
                                </div>
                            `,
                              )
                              .join("")}
                        </div>
                    `
                        : ""
                    }
                </div>
                ${
                  recipe.instructions
                    ? `
                    <div class="recipe-instructions">
                        <strong>Preparación:</strong> ${recipe.instructions}
                    </div>
                `
                    : ""
                }
                </div>
                <div class="recipe-image-wrapper">
                <img
                  class="recipe-image"
                  src="/spirits/${recipe.name?.toLowerCase()}.jpg"
                  alt=""
                  onerror="this.onerror=null; this.src='/spirits/default.png';"
                />
                </div>
            </div>
        `;
    })
    .join("");
}

// Inicializar al cargar la página
document.addEventListener("DOMContentLoaded", loadData);
