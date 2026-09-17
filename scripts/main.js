/*
 * Данные для карточки товара.
 */
const productData = {
  id: 1,
  title: "Ананасовый улун",
  image: "assets/pineapple_ulun.jpg",
  imageAlt: "Ананасовый улун — китайский ароматизированный чай",
  category: "Улун",
  variants: [
    {
      id: 1306,
      article: "01306",
      weight: "100 г",
      price: 326.4,
      oldPrice: 349.2,
    },
    {
      id: 1307,
      article: "01307",
      weight: "500 г",
      price: 1432,
      oldPrice: 1646,
    },
    {
      id: 1308,
      article: "01308",
      weight: "1000 г",
      price: 2064,
      oldPrice: 2592,
    },
    {
      id: 1309,
      article: "01309",
      weight: "5000 г",
      price: 6320,
      oldPrice: 8710,
    },
  ],
};

/*
 * Форматирует цену в российском формате.
 * Например: 1432 -> "1 432 ₽", 326.4 -> "326,40 ₽".
 */
function formatPrice(value) {
  if (value == null || Number.isNaN(Number(value))) return "";

  const numericValue = Number(value);

  return (
    numericValue.toLocaleString("ru-RU", {
      minimumFractionDigits: Number.isInteger(numericValue) ? 0 : 2,
      maximumFractionDigits: 2,
    }) + "\u00A0₽"
  );
}

/*
 * Создаёт разметку одного варианта фасовки.
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

/*
 * Рендерит список доступных фасовок.
 */
function renderVariants() {
  const container = document.querySelector("[data-variants-container]");

  if (!container || !productData.variants.length) return;

  container.innerHTML = productData.variants
    .map((variant, index) => renderVariant(variant, index === 0))
    .join("");
}

/*
 * Обновляет артикул и цены выбранного варианта.
 */
function updateProductInfo(variant) {
  if (!variant) return;

  const articleEl = document.querySelector("[data-active-article]");
  const priceEl = document.querySelector("[data-active-price]");
  const oldPriceEl = document.querySelector("[data-active-old-price]");

  if (!articleEl || !priceEl || !oldPriceEl) return;

  articleEl.textContent = variant.article;
  priceEl.textContent = formatPrice(variant.price);

  if (variant.oldPrice) {
    oldPriceEl.textContent = formatPrice(variant.oldPrice);
    oldPriceEl.hidden = false;
  } else {
    oldPriceEl.hidden = true;
    oldPriceEl.textContent = "";
  }
}

/*
 * Инициализирует кнопку добавления в корзину.
 * Кнопка только переключает своё визуальное состояние.
 */
function initCartButton() {
  const cartBtn = document.querySelector("[data-cart-btn]");
  const cartLabel = document.querySelector("[data-cart-label]");

  if (!cartBtn || !cartLabel) return;

  let isInCart = false;

  cartBtn.addEventListener("click", () => {
    isInCart = !isInCart;

    cartBtn.classList.toggle("product-card__cart-btn--added", isInCart);
    cartBtn.setAttribute("aria-pressed", String(isInCart));
    cartLabel.textContent = isInCart ? "В корзине" : "В корзину";
  });
}

/*
 * Обрабатывает изменение выбранной фасовки.
 * Используется делегирование событий, поскольку варианты
 * создаются динамически.
 */
function handleVariantChange(event) {
  if (!event.target.matches("[data-variant-input]")) return;

  const selectedId = Number(event.target.value);
  const selectedVariant = productData.variants.find(
    (item) => item.id === selectedId,
  );

  if (!selectedVariant) return;

  updateProductInfo(selectedVariant);
}

/*
 * Инициализация карточки товара.
 */
function initProductCard() {
  const initialVariant = productData.variants[0];

  renderVariants();
  updateProductInfo(initialVariant);
  initCartButton();
}

document.addEventListener("change", handleVariantChange);

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initProductCard);
} else {
  initProductCard();
}
