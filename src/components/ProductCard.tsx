type Product = {
  name: string
  description: string
  price: string
  image: string
  category?: string
  tag?: string
}

type ProductCardProps = {
  product: Product
  onAddToCart?: () => void
  reveal?: boolean
}

function ProductCard({ product, onAddToCart, reveal = true }: ProductCardProps) {
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
        <strong>{product.price}</strong>
      </div>
    </article>
  )
}

export type { Product }
export default ProductCard
