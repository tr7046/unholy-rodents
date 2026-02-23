'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Package, Shirt, Sticker, Gift, Music, Plus, Minus, ShoppingCart, X, Truck, AlertCircle } from 'lucide-react';
import {
  StaggerContainer,
  StaggerItem,
  HoverCard,
  TornDivider,
  NoiseOverlay,
  MagneticHover,
} from '@/components/animations';
import { Visible } from '@/contexts/VisibilityContext';
import {
  Product,
  ProductVariant,
  ShippingRates,
  formatPrice,
  getLowestPrice,
  getTotalStock,
  isInStock,
} from '@/lib/products';
import { useCart, CartItem } from '@/lib/cart';

interface StoreClientProps {
  products: Product[];
  shippingRates: ShippingRates;
}

// ============================================
// PRODUCT CARD COMPONENT
// ============================================

function ProductCard({ product, onSelect }: { product: Product; onSelect: (product: Product) => void }) {
  const totalStock = getTotalStock(product);
  const lowestPrice = getLowestPrice(product);
  const hasVariantPrices = product.variants.some(v => v.price !== lowestPrice);

  return (
    <HoverCard className="card group cursor-pointer" onClick={() => onSelect(product)}>
      {/* Product Image */}
      <div className="aspect-square bg-[#0a0a0a] mb-4 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          {product.images[0] ? (
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <>
              {product.category === 'apparel' && <Shirt className="w-20 h-20 text-[#c41e3a]" />}
              {product.category === 'accessories' && <Sticker className="w-20 h-20 text-[#c41e3a]" />}
              {product.category === 'bundles' && <Gift className="w-20 h-20 text-[#c41e3a]" />}
              {product.category === 'music' && <Music className="w-20 h-20 text-[#c41e3a]" />}
            </>
          )}
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          {product.featured && (
            <span className="tag text-[10px]">Featured</span>
          )}
          {totalStock === 0 && (
            <span className="bg-[#888888] text-[#f5f5f0] px-2 py-1 text-[10px] font-mono uppercase">
              Sold Out
            </span>
          )}
          {totalStock > 0 && totalStock <= 5 && (
            <span className="bg-[#e63946] text-[#f5f5f0] px-2 py-1 text-[10px] font-mono uppercase">
              Low Stock
            </span>
          )}
        </div>

        {/* Hover overlay */}
        <motion.div
          className="absolute inset-0 bg-[#c41e3a]/0 group-hover:bg-[#c41e3a]/20 transition-colors flex items-center justify-center"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ opacity: 1, scale: 1 }}
            className="text-[#f5f5f0] font-display uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity"
          >
            View Details
          </motion.span>
        </motion.div>
      </div>

      {/* Product Info */}
      <h3 className="font-display text-lg text-[#f5f5f0] mb-1 group-hover:text-[#c41e3a] transition-colors">
        {product.name}
      </h3>
      <p className="text-[#888888] text-sm mb-2 line-clamp-2">{product.description}</p>
      <p className="font-display text-xl text-[#c41e3a]">
        {hasVariantPrices ? 'From ' : ''}{formatPrice(lowestPrice)}
      </p>
    </HoverCard>
  );
}

// ============================================
// PRODUCT MODAL
// ============================================

function ProductModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants.find(v => isInStock(v)) || product.variants[0]
  );
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const handleAddToCart = () => {
    if (selectedVariant && isInStock(selectedVariant)) {
      addItem(product, selectedVariant, quantity);
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a0a]/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#1a1a1a] max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-[#888888] hover:text-[#f5f5f0] transition-colors p-2"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6">
          {/* Product Image */}
          <div className="aspect-square bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden">
            {product.images[0] ? (
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <>
                {product.category === 'apparel' && <Shirt className="w-32 h-32 text-[#c41e3a]" />}
                {product.category === 'accessories' && <Sticker className="w-32 h-32 text-[#c41e3a]" />}
                {product.category === 'bundles' && <Gift className="w-32 h-32 text-[#c41e3a]" />}
                {product.category === 'music' && <Music className="w-32 h-32 text-[#c41e3a]" />}
              </>
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
            <span className="tag mb-2 w-fit">{product.category}</span>
            <h2 className="font-display text-2xl text-[#f5f5f0] mb-2">{product.name}</h2>
            <p className="text-[#888888] mb-4">{product.description}</p>

            {/* Price */}
            <p className="font-display text-3xl text-[#c41e3a] mb-6">
              {selectedVariant ? formatPrice(selectedVariant.price) : formatPrice(getLowestPrice(product))}
            </p>

            {/* Variant Selection */}
            {product.variants.length > 1 && (
              <div className="mb-4">
                <label className="block text-sm font-display uppercase tracking-wider text-[#f5f5f0] mb-2">
                  Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => {
                        setSelectedVariant(variant);
                        setQuantity(1);
                      }}
                      disabled={!isInStock(variant)}
                      className={`px-4 py-2 border-2 font-mono text-sm uppercase transition-colors ${
                        selectedVariant?.id === variant.id
                          ? 'border-[#c41e3a] bg-[#c41e3a] text-[#f5f5f0]'
                          : isInStock(variant)
                          ? 'border-[#888888] text-[#888888] hover:border-[#c41e3a] hover:text-[#c41e3a]'
                          : 'border-[#2a2a2a] text-[#2a2a2a] cursor-not-allowed line-through'
                      }`}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock indicator */}
            {selectedVariant && (
              <p className={`text-sm mb-4 ${selectedVariant.stock <= 5 ? 'text-[#e63946]' : 'text-[#888888]'}`}>
                {selectedVariant.stock === 0
                  ? 'Out of stock'
                  : selectedVariant.stock <= 5
                  ? `Only ${selectedVariant.stock} left!`
                  : `${selectedVariant.stock} in stock`}
              </p>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-display uppercase tracking-wider text-[#f5f5f0] mb-2">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-[#888888] flex items-center justify-center text-[#f5f5f0] hover:border-[#c41e3a] hover:text-[#c41e3a] transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-mono text-xl text-[#f5f5f0] w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(selectedVariant?.stock || 1, quantity + 1))}
                  className="w-10 h-10 border border-[#888888] flex items-center justify-center text-[#f5f5f0] hover:border-[#c41e3a] hover:text-[#c41e3a] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <Visible path="elements.buttons.storeAddToCart">
              <motion.button
                onClick={handleAddToCart}
                disabled={!selectedVariant || !isInStock(selectedVariant)}
                className="btn btn-blood w-full disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {selectedVariant && isInStock(selectedVariant) ? 'Add to Cart' : 'Sold Out'}
              </motion.button>
            </Visible>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// CART SIDEBAR
// ============================================

function CartSidebar({ isOpen, onClose, shippingRates }: { isOpen: boolean; onClose: () => void; shippingRates: ShippingRates }) {
  const {
    items,
    shippingMethod,
    setShippingMethod,
    removeItem,
    updateQuantity,
    getSubtotal,
    getShipping,
    getTotal,
    isEligibleForFreeShipping,
    amountUntilFreeShipping,
    clearCart,
  } = useCart();

  const [paymentConfigured, setPaymentConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    if (isOpen && paymentConfigured === null) {
      fetch('/api/payment-config')
        .then((res) => res.ok ? res.json() : null)
        .then((data) => setPaymentConfigured(!!data?.configured))
        .catch(() => setPaymentConfigured(false));
    }
  }, [isOpen, paymentConfigured]);

  const freeShipping = isEligibleForFreeShipping();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md z-50 bg-[#1a1a1a] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-[#2a2a2a] flex items-center justify-between">
              <h2 className="font-display text-2xl text-[#f5f5f0]">YOUR CART</h2>
              <button onClick={onClose} className="text-[#888888] hover:text-[#f5f5f0] transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 text-[#888888] mx-auto mb-4" />
                  <p className="text-[#888888]">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <CartItemCard
                      key={item.variantId}
                      item={item}
                      onRemove={() => removeItem(item.variantId)}
                      onUpdateQuantity={(qty) => updateQuantity(item.variantId, qty)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer with totals */}
            {items.length > 0 && (
              <div className="p-6 border-t border-[#2a2a2a] space-y-4">
                {/* Free shipping progress */}
                {!freeShipping && (
                  <div className="bg-[#0a0a0a] p-3">
                    <p className="text-sm text-[#888888] mb-2">
                      <Truck className="w-4 h-4 inline mr-1" />
                      Add {formatPrice(amountUntilFreeShipping())} more for free shipping!
                    </p>
                    <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-[#c41e3a]"
                        initial={{ width: 0 }}
                        animate={{ width: `${(getSubtotal() / shippingRates.freeShippingThreshold) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Shipping method */}
                <div>
                  <label className="block text-sm font-display uppercase tracking-wider text-[#f5f5f0] mb-2">
                    Shipping
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="shipping"
                        checked={shippingMethod === 'standard'}
                        onChange={() => setShippingMethod('standard')}
                        className="accent-[#c41e3a]"
                      />
                      <span className="flex-1 text-[#f5f5f0] text-sm">
                        {shippingRates.standard.name} ({shippingRates.standard.estimatedDays})
                      </span>
                      <span className="text-[#c41e3a] font-mono">
                        {freeShipping ? 'FREE' : formatPrice(shippingRates.standard.price)}
                      </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="shipping"
                        checked={shippingMethod === 'express'}
                        onChange={() => setShippingMethod('express')}
                        className="accent-[#c41e3a]"
                      />
                      <span className="flex-1 text-[#f5f5f0] text-sm">
                        {shippingRates.express.name} ({shippingRates.express.estimatedDays})
                      </span>
                      <span className="text-[#c41e3a] font-mono">
                        {freeShipping ? 'FREE' : formatPrice(shippingRates.express.price)}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Totals */}
                <div className="space-y-2 pt-4 border-t border-[#2a2a2a]">
                  <div className="flex justify-between text-[#888888]">
                    <span>Subtotal</span>
                    <span className="font-mono">{formatPrice(getSubtotal())}</span>
                  </div>
                  <div className="flex justify-between text-[#888888]">
                    <span>Shipping</span>
                    <span className="font-mono">
                      {getShipping() === 0 ? 'FREE' : formatPrice(getShipping())}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#f5f5f0] font-display text-xl pt-2">
                    <span>Total</span>
                    <span className="text-[#c41e3a]">{formatPrice(getTotal())}</span>
                  </div>
                </div>

                {/* Checkout button */}
                {paymentConfigured === false ? (
                  <div className="bg-[#0a0a0a] border border-[#333] p-3 text-center">
                    <AlertCircle className="w-5 h-5 text-[#888888] mx-auto mb-1" />
                    <p className="text-sm text-[#888888]">Checkout coming soon</p>
                  </div>
                ) : (
                  <motion.button
                    className="btn btn-blood w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={paymentConfigured ? { scale: 1.02 } : {}}
                    whileTap={paymentConfigured ? { scale: 0.98 } : {}}
                    disabled={!paymentConfigured}
                    onClick={() => {
                      // TODO: Implement checkout flow with configured payment provider
                    }}
                  >
                    {paymentConfigured === null ? 'Loading...' : 'Checkout'}
                  </motion.button>
                )}

                <button
                  onClick={clearCart}
                  className="w-full text-center text-[#888888] hover:text-[#c41e3a] text-sm transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function CartItemCard({
  item,
  onRemove,
  onUpdateQuantity,
}: {
  item: CartItem;
  onRemove: () => void;
  onUpdateQuantity: (qty: number) => void;
}) {
  return (
    <div className="flex gap-4 bg-[#0a0a0a] p-4">
      <div className="w-20 h-20 bg-[#2a2a2a] flex items-center justify-center flex-shrink-0">
        <Package className="w-8 h-8 text-[#c41e3a]" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-display text-[#f5f5f0] text-sm truncate">{item.productName}</h4>
        <p className="text-[#888888] text-xs">{item.variantName}</p>
        <p className="text-[#c41e3a] font-mono mt-1">{formatPrice(item.price)}</p>

        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => onUpdateQuantity(item.quantity - 1)}
            className="w-6 h-6 border border-[#888888] flex items-center justify-center text-[#f5f5f0] hover:border-[#c41e3a] text-xs"
          >
            -
          </button>
          <span className="font-mono text-[#f5f5f0] text-sm w-6 text-center">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.quantity + 1)}
            className="w-6 h-6 border border-[#888888] flex items-center justify-center text-[#f5f5f0] hover:border-[#c41e3a] text-xs"
          >
            +
          </button>
        </div>
      </div>
      <button onClick={onRemove} className="text-[#888888] hover:text-[#c41e3a] transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ============================================
// MAIN STORE CLIENT COMPONENT
// ============================================

export default function StoreClient({ products, shippingRates }: StoreClientProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | Product['category']>('all');
  const { getItemCount, setShippingRates } = useCart();

  // Sync shipping rates from server into cart store
  useEffect(() => {
    setShippingRates(shippingRates);
  }, [shippingRates, setShippingRates]);

  const filteredProducts = filter === 'all'
    ? products
    : products.filter(p => p.category === filter);

  return (
    <div className="relative pt-20">
      <NoiseOverlay />

      {/* Header */}
      <section className="py-16 bg-[#0a0a0a] relative overflow-hidden">
        <motion.div
          className="absolute top-0 right-1/4 w-96 h-96 bg-[#c41e3a]/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 5, repeat: Infinity }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: -2 }}
            transition={{ duration: 0.5 }}
          >
            <span className="tag mb-4 inline-block">Merch</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[#f5f5f0] mb-4"
          >
            STORE
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-[#888888]"
          >
            Gear up. Rep the horde.
          </motion.p>
        </div>
      </section>

      <TornDivider color="charcoal" />

      {/* Store Content */}
      <section className="section bg-[#1a1a1a]">
        <div className="container mx-auto px-4">
          {/* Filters & Cart */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-12">
            {/* Category filters */}
            <Visible path="sections.store.filters">
              <div className="flex flex-wrap gap-2">
                {(['all', 'apparel', 'accessories', 'bundles', 'music'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-4 py-2 font-display uppercase tracking-wider text-sm transition-colors ${
                      filter === cat
                        ? 'bg-[#c41e3a] text-[#f5f5f0]'
                        : 'bg-[#0a0a0a] text-[#888888] hover:text-[#c41e3a]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </Visible>

            {/* Cart button */}
            <Visible path="elements.buttons.storeViewCart">
              <MagneticHover>
                <motion.button
                  onClick={() => setCartOpen(true)}
                  className="btn btn-outline relative"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Cart
                  {getItemCount() > 0 && (
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-[#c41e3a] text-[#f5f5f0] rounded-full flex items-center justify-center text-xs font-mono">
                      {getItemCount()}
                    </span>
                  )}
                </motion.button>
              </MagneticHover>
            </Visible>
          </div>

          {/* Product Grid */}
          <Visible path="sections.store.productGrid">
            <StaggerContainer className="grid grid-cols-1 xs:grid-cols-2 tablet:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <StaggerItem key={product.id}>
                  <ProductCard product={product} onSelect={setSelectedProduct} />
                </StaggerItem>
              ))}
            </StaggerContainer>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-[#888888] mx-auto mb-4" />
                <p className="text-[#888888]">No products in this category yet.</p>
              </div>
            )}
          </Visible>
        </div>
      </section>

      {/* Free Shipping Banner */}
      <Visible path="sections.store.freeShippingBanner">
        <section className="bg-[#c41e3a] py-4">
          <div className="container mx-auto px-4 text-center">
            <p className="text-[#f5f5f0] font-display uppercase tracking-wider">
              <Truck className="w-5 h-5 inline mr-2" />
              Free shipping on orders over {formatPrice(shippingRates.freeShippingThreshold)}
            </p>
          </div>
        </section>
      </Visible>

      {/* Product Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
        )}
      </AnimatePresence>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} shippingRates={shippingRates} />
    </div>
  );
}
