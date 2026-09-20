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

const CART_STORAGE_KEY = "teaboom-cart";
const MAX_QTY = 99;

/*
 * Слой хранения корзины.
 */
const cartStorage = {
  load() {
    try {
      const savedState = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));

      if (
        !savedState ||
        typeof savedState !== "object" ||
        Array.isArray(savedState)
      ) {
        return {};
      }

      return savedState;
    } catch {
      return {};
    }
  },

  save(state) {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn("Корзина: не удалось сохранить состояние", error);
    }
  },
};

const cartState = cartStorage.load();

/* ID выбранной фасовки; по умолчанию используется первая */
let currentVariantId = productData.variants[0]?.id ?? null;

/*
 * Форматирует цену в российском формате.
 * Например: 1432 -> "1 432 ₽", 326.4 -> "326,40 ₽".
 */
function formatPrice(value) {
  if (value == null) return "";

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) return "";

  return (
    numericValue.toLocaleString("ru-RU", {
      minimumFractionDigits: Number.isInteger(numericValue) ? 0 : 2,
      maximumFractionDigits: 2,
    }) + "\u00A0₽"
  );
}

/*
 * Формирует HTML одного варианта фасовки.
 * Сейчас данные статические; для данных из API
 * нужно будет создавать элементы через createElement и
 * записывать текст через textContent.
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
 * Обновляет артикул, текущую и старую цену выбранного варианта.
 * Скрывает старую цену, если скидка отсутствует.
 */
function updateProductInfo(variant) {
  if (!variant) return;

  const articleEl = document.querySelector("[data-active-article]");
  const priceEl = document.querySelector("[data-active-price]");
  const oldPriceEl = document.querySelector("[data-active-old-price]");

  if (!articleEl || !priceEl || !oldPriceEl) return;

  articleEl.textContent = variant.article;
  priceEl.textContent = formatPrice(variant.price);

  const oldPrice = Number(variant.oldPrice);
  const price = Number(variant.price);

  const hasOldPrice =
    Number.isFinite(oldPrice) && Number.isFinite(price) && oldPrice > price;

  oldPriceEl.hidden = !hasOldPrice;
  oldPriceEl.textContent = hasOldPrice ? formatPrice(oldPrice) : "";
}

/*
 * Возвращает количество выбранной фасовки в корзине.
 */
function getQty(variantId) {
  if (variantId == null) return 0;

  const qty = Number(cartState[variantId]);

  if (!Number.isInteger(qty) || qty <= 0) return 0;

  return Math.min(qty, MAX_QTY);
}

/*
 * Нормализует количество, удаляет товар при значении 0,
 * сохраняет корзину и обновляет интерфейс.
 */
function setQty(variantId, qty) {
  if (variantId == null) return;

  const normalizedQty = Math.floor(Number(qty));

  if (!Number.isFinite(normalizedQty) || normalizedQty <= 0) {
    delete cartState[variantId];
  } else {
    cartState[variantId] = Math.min(normalizedQty, MAX_QTY);
  }

  cartStorage.save(cartState);
  renderCartZone(variantId);
}

/*
 * Обновляет состояние кнопки и счётчика
 * для переданной фасовки.
 */
function renderCartZone(variantId) {
  const cartBtn = document.querySelector("[data-cart-btn]");
  const cartLabel = document.querySelector("[data-cart-label]");
  const count = document.querySelector("[data-cart-count]");
  const countValue = document.querySelector("[data-cart-count-value]");
  const increaseBtn = document.querySelector("[data-cart-count-increase]");

  if (!cartBtn || !cartLabel || !count || !countValue || !increaseBtn) return;

  const qty = getQty(variantId);
  const inCart = qty > 0;

  cartBtn.classList.toggle("product-card__cart-btn--added", inCart);
  cartBtn.setAttribute("aria-pressed", String(inCart));
  cartLabel.textContent = inCart ? "В корзине" : "В корзину";

  count.hidden = !inCart;
  countValue.textContent = String(qty);
  increaseBtn.disabled = qty >= MAX_QTY;
}

/*
 * Обрабатывает клики по кнопке корзины и кнопкам +/- в счётчике.
 */
function handleCartClick(event) {
  if (!(event.target instanceof Element)) return;

  const decrease = event.target.closest("[data-cart-count-decrease]");
  const increase = event.target.closest("[data-cart-count-increase]");
  const cartBtn = event.target.closest("[data-cart-btn]");

  if (!decrease && !increase && !cartBtn) return;

  const qty = getQty(currentVariantId);

  if (decrease) setQty(currentVariantId, qty - 1);
  else if (increase) setQty(currentVariantId, qty + 1);
  else if (cartBtn) setQty(currentVariantId, qty > 0 ? 0 : 1);
}

/*
 * Обрабатывает изменение выбранной фасовки.
 */
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

/*
 * Инициализация карточки товара.
 */
function initProductCard() {
  const initialVariant = productData.variants[0];

  renderVariants();
  updateProductInfo(initialVariant);
  renderCartZone(currentVariantId);
}

document.addEventListener("change", handleVariantChange);
document.addEventListener("click", handleCartClick);

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initProductCard);
} else {
  initProductCard();
}
