/*
 * Страница товара: читает ID из URL, находит товар в products[],
 * заполняет карточку и запускает логику выбора фасовки и корзины.
 */

/*
 * Читает ID товара из URL (product.html?id=1).
 * Возвращает null, если параметр отсутствует.
 */
function getProductIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");
  return id ? Number(id) : null;
}

/*
 * Находит товар в массиве products по ID.
 * Если не найден, возвращает первый товар.
 */
function findProduct(id) {
  if (id == null) return products[0];
  return products.find((p) => p.id === id) ?? products[0];
}

/*
 * Заполняет шапку карточки: заголовок, картинку, категорию.
 */
function fillProductHeader(product) {
  document.title = `${product.title} — Teaboom`;

  const titleEl = document.querySelector("[data-product-title]");
  const imageEl = document.querySelector("[data-product-image]");
  const categoryEl = document.querySelector("[data-product-category]");

  if (titleEl) titleEl.textContent = product.title;

  if (imageEl) {
    imageEl.src = product.image;
    imageEl.alt = product.imageAlt;
  }

  if (categoryEl) categoryEl.textContent = product.category;
}

/*
 * Заполняет описание товара.
 * Если description — массив строк, рендерит параграфы.
 * Если строка — один параграф.
 */
function fillProductDescription(product) {
  const container = document.querySelector("[data-product-description]");
  if (!container || !product.description) return;

  const title = container.querySelector(".product-card__description-title");

  container.innerHTML = "";
  if (title) container.appendChild(title);

  const paragraphs = Array.isArray(product.description)
    ? product.description
    : [product.description];

  paragraphs.forEach((text) => {
    const p = document.createElement("p");
    p.textContent = text;
    container.appendChild(p);
  });
}

let productData;
let currentVariantId;

/*
 * Формирует HTML одного варианта фасовки.
 */
function renderVariant(variant, isFirst) {
  return `
    <label class="product-card__variant">
      <input
        class="product-card__variant-input visually-hidden"
        type="radio"
        name="variant"
        value="${variant.id}"
        data-variant-input
        ${isFirst ? "checked" : ""}
      >
      <span class="product-card__variant-body">
        <span class="product-card__variant-weight">${variant.weight}</span>
      </span>
    </label>
  `;
}

function renderVariants() {
  const container = document.querySelector("[data-variants-container]");
  if (!container || !productData.variants.length) return;

  const radioName = `variant-${productData.id}`;

  container.innerHTML = productData.variants
    .map((variant, index) =>
      renderVariantTemplate(variant, index === 0, radioName),
    )
    .join("");
}

function updateProductInfo(variant) {
  if (!variant) return;

  const articleEl = document.querySelector("[data-active-article]");
  const priceEl = document.querySelector("[data-active-price]");
  const oldPriceEl = document.querySelector("[data-active-old-price]");

  if (!articleEl || !priceEl || !oldPriceEl) return;

  articleEl.textContent = variant.article;
  priceEl.textContent = formatPrice(variant.price);

  const showOldPrice = hasValidOldPrice(variant);

  oldPriceEl.hidden = !showOldPrice;
  oldPriceEl.textContent = showOldPrice ? formatPrice(variant.oldPrice) : "";
}

function renderCartZone(variantId) {
  const cartBtn = document.querySelector("[data-cart-btn]");
  const cartLabel = document.querySelector("[data-cart-label]");
  const count = document.querySelector("[data-cart-count]");
  const countValue = document.querySelector("[data-cart-count-value]");
  const increaseBtn = document.querySelector("[data-cart-count-increase]");

  if (!cartBtn || !cartLabel || !count || !countValue || !increaseBtn) return;

  const qty = getQty(variantId);

  updateCartUI(cartBtn, cartLabel, count, countValue, increaseBtn, qty);
}

function handleCartClick(event) {
  if (applyCartAction(event.target, currentVariantId)) {
    renderCartZone(currentVariantId);
  }
}

function handleVariantChange(event) {
  if (!(event.target instanceof Element)) return;
  if (!event.target.matches("[data-variant-input]")) return;

  const selectedId = Number(event.target.value);
  const selectedVariant = productData.variants.find(
    (item) => item.id === selectedId,
  );

  if (!selectedVariant) return;

  currentVariantId = selectedId;
  updateProductInfo(selectedVariant);
  renderCartZone(selectedId);
}

function initProductPage() {
  const productId = getProductIdFromUrl();

  productData = findProduct(productId);

  if (!productData) {
    console.error("Товар не найден");
    return;
  }

  currentVariantId = productData.variants[0]?.id ?? null;

  fillProductHeader(productData);
  fillProductDescription(productData);

  renderVariants();
  updateProductInfo(productData.variants[0]);
  renderCartZone(currentVariantId);
}

document.addEventListener("change", handleVariantChange);
document.addEventListener("click", handleCartClick);

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initProductPage);
} else {
  initProductPage();
}
