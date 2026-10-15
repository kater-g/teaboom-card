/*
 * Общие утилиты и логика корзины.
 * Используется на странице товара и в каталоге.
 */

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
 * сохраняет корзину.
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
}

/*
 * Обрабатывает клик по элементам корзины (кнопка, «+», «−»).
 * Меняет количество в корзине для переданного варианта.
 * Возвращает true, если клик относился к корзине.
 */
function applyCartAction(target, variantId) {
  if (!(target instanceof Element)) return false;

  const decrease = target.closest("[data-cart-count-decrease]");
  const increase = target.closest("[data-cart-count-increase]");
  const cartBtn = target.closest("[data-cart-btn]");

  if (!decrease && !increase && !cartBtn) return false;

  const qty = getQty(variantId);

  if (decrease) {
    setQty(variantId, qty - 1);
  } else if (increase) {
    setQty(variantId, qty + 1);
  } else {
    setQty(variantId, qty > 0 ? 0 : 1);
  }

  return true;
}

/*
 * Формирует HTML одного варианта фасовки.
 * Используется на странице товара и в каталоге.
 */
function renderVariantTemplate(variant, isFirst, radioName) {
  return `
    <label class="product-card__variant">
      <input
        class="product-card__variant-input visually-hidden"
        type="radio"
        name="${radioName}"
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
 * Определяет, нужно ли показывать старую цену.
 */
function hasValidOldPrice(variant) {
  const oldPrice = Number(variant.oldPrice);
  const price = Number(variant.price);

  return (
    Number.isFinite(oldPrice) && Number.isFinite(price) && oldPrice > price
  );
}

/*
 * Обновляет состояние кнопки корзины и счётчика.
 * Принимает DOM-элементы и количество.
 */
function updateCartUI(
  cartBtn,
  cartLabel,
  cartCount,
  cartCountValue,
  increaseBtn,
  qty,
) {
  const inCart = qty > 0;

  cartBtn.classList.toggle("product-card__cart-btn--added", inCart);
  cartBtn.setAttribute("aria-pressed", String(inCart));
  cartLabel.textContent = inCart ? "В корзине" : "В корзину";

  cartCount.hidden = !inCart;
  cartCountValue.textContent = String(qty);
  increaseBtn.disabled = qty >= MAX_QTY;
}
