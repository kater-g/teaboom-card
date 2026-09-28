/*
 * Класс для управления одной карточкой товара в каталоге.
 */
class ProductCard {
  constructor(rootElement, product) {
    this.root = rootElement;
    this.product = product;
    this.currentVariantId = product.variants[0]?.id ?? null;

    this.cacheDom();
    this.bindEvents();
    this.renderVariants();
    this.updatePrice();
    this.renderCartZone();
  }

  cacheDom() {
    this.variantsContainer = this.root.querySelector(
      "[data-variants-container]",
    );
    this.priceEl = this.root.querySelector("[data-active-price]");
    this.oldPriceEl = this.root.querySelector("[data-active-old-price]");
    this.cartBtn = this.root.querySelector("[data-cart-btn]");
    this.cartLabel = this.root.querySelector("[data-cart-label]");
    this.cartCount = this.root.querySelector("[data-cart-count]");
    this.cartCountValue = this.root.querySelector("[data-cart-count-value]");
    this.increaseBtn = this.root.querySelector("[data-cart-count-increase]");
  }

  bindEvents() {
    this.root.addEventListener("click", this.handleCartClick.bind(this));
    this.root.addEventListener("change", this.handleVariantChange.bind(this));
  }

  renderVariants() {
    if (!this.variantsContainer || !this.product.variants.length) return;

    const radioName = `variant-${this.product.id}`;

    this.variantsContainer.innerHTML = this.product.variants
      .map((variant, index) =>
        renderVariantTemplate(variant, index === 0, radioName),
      )
      .join("");
  }

  updatePrice() {
    if (!this.priceEl) return;

    const currentVariant = this.product.variants.find(
      (v) => v.id === this.currentVariantId,
    );

    if (!currentVariant) return;

    this.priceEl.textContent = formatPrice(currentVariant.price);

    const showOldPrice = hasValidOldPrice(currentVariant);

    if (this.oldPriceEl) {
      this.oldPriceEl.hidden = !showOldPrice;
      this.oldPriceEl.textContent = showOldPrice
        ? formatPrice(currentVariant.oldPrice)
        : "";
    }
  }

  renderCartZone() {
    const qty = getQty(this.currentVariantId);

    updateCartUI(
      this.cartBtn,
      this.cartLabel,
      this.cartCount,
      this.cartCountValue,
      this.increaseBtn,
      qty,
    );
  }

  handleCartClick(event) {
    if (!(event.target instanceof Element)) return;

    const decrease = event.target.closest("[data-cart-count-decrease]");
    const increase = event.target.closest("[data-cart-count-increase]");
    const cartBtn = event.target.closest("[data-cart-btn]");

    if (!decrease && !increase && !cartBtn) return;

    // Останавливает всплытие, чтобы клик не сработал как переход по ссылке
    event.preventDefault();
    event.stopPropagation();

    const qty = getQty(this.currentVariantId);

    if (decrease) {
      setQty(this.currentVariantId, qty - 1);
    } else if (increase) {
      setQty(this.currentVariantId, qty + 1);
    } else if (cartBtn) {
      setQty(this.currentVariantId, qty > 0 ? 0 : 1);
    }

    this.renderCartZone();
  }

  handleVariantChange(event) {
    if (!(event.target instanceof Element)) return;
    if (!event.target.matches("[data-variant-input]")) return;

    this.currentVariantId = Number(event.target.value);
    this.updatePrice();
    this.renderCartZone();
  }
}

/*
 * Рендерит HTML одной компактной карточки товара.
 */
function renderProductCard(product) {
  const firstVariant = product.variants[0];
  const price = formatPrice(firstVariant.price);

  return `
    <li class="cards-catalog__item product-card product-card--compact" data-product-id="${product.id}">
      <div class="product-card__compact-layout">
        <a href="pages/product.html?id=${product.id}" class="product-card__compact-link">
          <img
            src="${product.image}"
            alt="${product.imageAlt}"
            class="product-card__image product-card__compact-image"
          >
          <h2 class="product-card__compact-title">${product.title}</h2>
        </a>

        <fieldset class="product-card__variants">
          <legend class="visually-hidden">Выберите фасовку</legend>
          <div class="product-card__variants-list product-card__variants-compact" data-variants-container></div>
        </fieldset>

        <div class="product-card__summary" aria-live="polite">
          <div class="product-card__summary-row product-card__summary-row--price">
            <del
              class="product-card__summary-old-price"
              data-active-old-price
              hidden
            ></del>
            <span class="product-card__summary-price" data-active-price>${price}</span>
          </div>
        </div>

        <div class="product-card__cart-zone" data-cart-zone>
          <button
            class="product-card__cart-btn"
            type="button"
            data-cart-btn
            aria-pressed="false"
          >
            <span class="product-card__cart-btn-text" data-cart-label>В корзину</span>
          </button>
          <div
            class="product-card__count"
            data-cart-count
            role="group"
            aria-label="Количество товара в корзине"
            hidden
          >
            <button
              class="product-card__count-btn"
              data-cart-count-decrease
              type="button"
              aria-label="Уменьшить количество"
            >−</button>
            <span class="product-card__count-value" data-cart-count-value aria-live="polite">1</span>
            <button
              class="product-card__count-btn"
              data-cart-count-increase
              type="button"
              aria-label="Увеличить количество"
            >+</button>
          </div>
        </div>
      </div>
    </li>
  `;
}

/*
 * Инициализация каталога: рендерит карточки и создаёт экземпляры ProductCard.
 */
function initCatalog() {
  const container = document.querySelector("[data-products-container]");
  if (!container) return;

  container.innerHTML = products.map(renderProductCard).join("");

  const cardElements = container.querySelectorAll("[data-product-id]");
  cardElements.forEach((cardElement) => {
    const productId = Number(cardElement.dataset.productId);
    const product = products.find((p) => p.id === productId);
    if (product) {
      new ProductCard(cardElement, product);
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCatalog);
} else {
  initCatalog();
}
