type Product = {
  _id?: string
  name: string
  description: string
  price: number
  image: string
  category?: string
  tag?: string
}

type ProductCardProps = {
  product?: Product
  onAddToCart?: () => void
  reveal?: boolean
  isLoading?: boolean
}

function ProductCard({
  product,
  onAddToCart,
  reveal = true,
  isLoading = false,
}: ProductCardProps) {
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

  return (
    <article className="product-card" {...(reveal ? { "data-reveal": "tilt" } : {})}>
      <div className="product-image">
        {product.tag && <span className="product-tag">{product.tag}</span>}
        <img src={product.image} alt={product.name} loading="lazy" />
        <button className="quick-add" type="button" onClick={onAddToCart}>
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
  )
}

export type { Product }
export default ProductCard
