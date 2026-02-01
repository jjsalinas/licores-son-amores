import "./styles.css";
import data from "./data.json";
let spiritsData = [];
let recipesData = [];

// Cargar datos desde JSON
async function loadData() {
  console.log("data");
  console.log(data);
  try {
    spiritsData = data.spirits;
    recipesData = data.recipes;
    renderSpirits();
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
  }
}

function toggleSpirit(index) {
  const card = document.getElementById(`spirit-${index}`);
  const checkbox = document.getElementById(`check-${index}`);
  checkbox.checked = !checkbox.checked;
  card.classList.toggle("selected");

  // Check enable/disable mix button on card toggle
  updateMixButtonStatus();
}

function updateMixButtonStatus() {
  const section = document.getElementsByClassName("section");
  const selected = getSelectedSpirits();
  if (section && section.length > 0) {
    section[0].querySelector(".mix-button").disabled = selected.length === 0;
  }
}

function getSelectedSpirits() {
  const selectedSpirits = [];
  spiritsData.forEach((spirit, index) => {
    const checkbox = document.getElementById(`check-${index}`);
    if (checkbox.checked) {
      selectedSpirits.push(spirit.type);
    }
  });
  return selectedSpirits;
}

function findRecipes() {
  const selectedSpirits = getSelectedSpirits();
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
                <div class="recipe-name">${recipe.name}</div>
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
        `;
    })
    .join("");
}

// Inicializar al cargar la página
document.addEventListener("DOMContentLoaded", loadData);
