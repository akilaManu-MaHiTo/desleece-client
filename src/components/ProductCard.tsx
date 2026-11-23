import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

type Product = {
  _id?: string
  name: string
  description: string
  price: number
  image: string
  category?: string
  tag?: string
  oneKilo?: number
  oneAndHalfKilo?: number
  twoKilo?: number
}

type ProductCardProps = {
  product?: Product
  onAddToCart?: (productId: string) => void
  reveal?: boolean
  isLoading?: boolean
}

function ProductCard({
  product,
  onAddToCart,
  reveal = true,
  isLoading = false,
}: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [weight, setWeight] = useState<"1" | "1.5" | "2">("1")

  useEffect(() => {
    if (!isModalOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsModalOpen(false)
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [isModalOpen])

  if (isLoading) {
    return (
      <article
        className="product-card product-card-loading"
        aria-busy="true"
        aria-label="Loading cake"
        {...(reveal ? { "data-reveal": "tilt" } : {})}
      >
        <div className="product-image skeleton-block" />
        <div className="product-info product-info-loading">
          <div className="skeleton-text-group">
            <span className="skeleton-block skeleton-title" />
            <span className="skeleton-block skeleton-description" />
          </div>
          <span className="skeleton-block skeleton-price" />
        </div>
      </article>
    )
  }

  if (!product) return null

  const basePrice = product.oneKilo ?? product.price
  const weightExtra =
    weight === "1.5"
      ? product.oneAndHalfKilo ?? 0
      : weight === "2"
        ? product.twoKilo ?? 0
        : 0
  const unitPrice = basePrice + weightExtra
  const totalPrice = unitPrice * quantity

  const closeModal = () => {
    setIsModalOpen(false)
    setQuantity(1)
    setWeight("1")
  }

  const addToBag = () => {
    if (product._id) onAddToCart?.(product._id)
    closeModal()
  }

  return (
    <>
      <article className="product-card" {...(reveal ? { "data-reveal": "tilt" } : {})}>
        <div className="product-image">
          {product.tag && <span className="product-tag">{product.tag}</span>}
          <img src={product.image} alt={product.name} loading="lazy" />
          <button
            className="quick-add"
            type="button"
            onClick={() => setIsModalOpen(true)}
          >
            + Add to bag
          </button>
        </div>
        <div className="product-info">
          <div>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
          </div>
          <strong>Rs. {product.price.toLocaleString("en-LK")}</strong>
        </div>
      </article>

      {isModalOpen &&
        createPortal(
          <div
            className="cake-modal-backdrop"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeModal()
            }}
          >
            <div
              className="cake-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="cake-modal-title"
            >
              <button
                className="cake-modal-close"
                type="button"
                onClick={closeModal}
                aria-label="Close"
              >
                ×
              </button>

              <div className="cake-modal-image">
                <img src={product.image} alt={product.name} />
              </div>

              <div className="cake-modal-details">
                {product.tag && <p className="eyebrow">{product.tag}</p>}
                <h2 id="cake-modal-title">{product.name}</h2>
                <p className="cake-modal-description">{product.description}</p>

                <fieldset className="cake-option-group">
                  <legend>Weight</legend>
                  <div className="cake-weight-options">
                    {[
                      { value: "1" as const, label: "1 kg" },
                      { value: "1.5" as const, label: "1.5 kg" },
                      { value: "2" as const, label: "2 kg" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={weight === option.value ? "is-selected" : ""}
                        onClick={() => setWeight(option.value)}
                        aria-pressed={weight === option.value}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div className="cake-modal-quantity">
                  <span>Quantity</span>
                  <div className="quantity-controls">
                    <button
                      type="button"
                      onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                      disabled={quantity === 1}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <strong>{quantity}</strong>
                    <button
                      type="button"
                      onClick={() => setQuantity((value) => value + 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="cake-modal-actions">
                  <button
                    className="cake-modal-add"
                    type="button"
                    onClick={addToBag}
                    disabled={!product._id}
                  >
                    Add to bag · Rs. {totalPrice.toLocaleString("en-LK")}
                  </button>
                  <button
                    className="cake-modal-cancel"
                    type="button"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}

export type { Product }
export default ProductCard
