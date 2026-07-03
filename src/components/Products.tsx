import React, { useState } from 'react';
import { 
  ShoppingBag, Search, Star, Filter, ShoppingCart, Plus, Minus, Trash2, 
  X, Check, Info, Award, ShieldCheck, Heart, Sparkles, Send, Gift
} from 'lucide-react';
import { Product, CartItem } from '../types';

const LITERARY_PRODUCTS: Product[] = [
  {
    id: 'prod_bookmark',
    name: 'Full-Grain Leather Bookmark',
    category: 'Accessories',
    price: 14.99,
    description: 'Artisan-crafted vegetable tanned leather bookmark designed to age gracefully over years of reading. Features hand-pressed celestial foil engravings and a sturdy linen tassel.',
    rating: 4.9,
    reviewCount: 142,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop',
    features: ['Handcrafted vegetable tanned leather', 'Customizable hot-foil gold initials', 'Traditional braided linen cord', 'Made with environmentally friendly dyes'],
    inStock: true
  },
  {
    id: 'prod_reading_light',
    name: 'Warm Amber LED Reading Lamp',
    category: 'Smart Tech',
    price: 24.95,
    description: 'An eye-protecting clip-on reading light radiating a 1600K warm amber glow that blocks 99.9% of blue light. Perfect for peaceful late-night reading sessions without disturbing your partner.',
    rating: 4.8,
    reviewCount: 389,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=400&auto=format&fit=crop',
    features: ['1600K block-blue warm spectrum light', '3 intensity level touches', 'USB-C rechargeable 1200mAh battery (up to 40 hours)', 'Lightweight dual-grip non-slip silicon clamp'],
    inStock: true
  },
  {
    id: 'prod_book_stand',
    name: 'Bamboo Multi-Angle Book Stand',
    category: 'Accessories',
    price: 29.99,
    description: 'An ergonomic, high-density natural bamboo book stand with 5 adjustable reading angles. Dual flexible spring page-holders keep bulky textbooks, cook books, or tablets locked in position.',
    rating: 4.7,
    reviewCount: 215,
    image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?q=80&w=400&auto=format&fit=crop',
    features: ['100% sustainably-harvested mature bamboo', '5 precision posture ergonomic tilt slots', 'Fold-flat design for compact shelf storage', 'Heavy-duty metal alloy spring holders'],
    inStock: true
  },
  {
    id: 'prod_mug',
    name: 'Just One More Chapter Cobalt Mug',
    category: 'Drinkware',
    price: 17.50,
    description: 'An oversized, comfortable-grip cobalt blue ceramic mug showcasing a minimalist design for bookworms. Sturdy enough to handle endless double-brewed coffee or herbal tea refills.',
    rating: 4.9,
    reviewCount: 94,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=400&auto=format&fit=crop',
    features: ['Premium lead-free artisan glazed ceramic', 'Generous 16oz volume capacity', 'Microwave and dishwasher durable print', 'Double-sided hand-lettered gold layout'],
    inStock: true
  },
  {
    id: 'prod_candle',
    name: 'Old Library Scented Soy Candle',
    category: 'Decor',
    price: 21.99,
    description: 'Evoke the mystical smell of ancient libraries. A rich sensory blend of mahogany, leather bindings, dried parchment, warm vanilla, and a dash of white clove.',
    rating: 4.6,
    reviewCount: 310,
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=400&auto=format&fit=crop',
    features: ['100% organic, hand-poured soy wax', 'Eco-friendly crackling wooden wick', 'Aromatic essential oil scent notes', 'Up to 55 hours burn-time in dark glass jar'],
    inStock: true
  },
  {
    id: 'prod_scanner',
    name: 'Bookverse Smart Text Highlighter',
    category: 'Smart Tech',
    price: 89.00,
    description: 'Scan printed text lines from any physical book or document to instantly copy quotes and sentences directly to your digital Bookverse notebook. Syncs wirelessly via Bluetooth.',
    rating: 4.5,
    reviewCount: 78,
    image: 'https://images.unsplash.com/photo-1526550517342-e086b357551e?q=80&w=400&auto=format&fit=crop',
    features: ['OCR text extraction in over 40 languages', 'Sleek pen-style Bluetooth 5.0 wand', 'Offline caching capacity of up to 2000 pages', 'Rechargeable Li-polymer quick charge battery'],
    inStock: true
  },
  {
    id: 'prod_sleeve',
    name: 'Protective Canvas Book Sleeve',
    category: 'Decor',
    price: 18.99,
    description: 'Ensure your precious paperbacks and hardcovers remain safe from spills, crinkles, and dust inside your daily backpack. Features a dedicated zippered front pocket for bookmarks and spectacles.',
    rating: 4.8,
    reviewCount: 165,
    image: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?q=80&w=400&auto=format&fit=crop',
    features: ['Triple-padded heavy-weight water-resistant canvas', 'Secured gold zipper closure', 'Front accessories pouch for reading glasses', 'Comfortably fits books up to 800 pages'],
    inStock: true
  },
  {
    id: 'prod_coasters',
    name: 'Classic Literary Quote Coasters',
    category: 'Decor',
    price: 13.95,
    description: 'Set of 4 vintage cork-backed dark walnut wooden coasters featuring laser-engraved quotes on wisdom, imagination, and adventure from Shakespeare, Austen, Poe, and Wilde.',
    rating: 4.7,
    reviewCount: 52,
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=400&auto=format&fit=crop',
    features: ['Genuine sustainable walnut wood veneer', 'Nonslip waterproof cork backing matrix', 'Deep laser cut typography layout', 'Protective heat-resistant sealer coat'],
    inStock: false
  }
];

export default function Products() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortOption, setSortOption] = useState<string>('featured');
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [customEngraving, setCustomEngraving] = useState('');
  const [isCheckoutSuccess, setIsCheckoutSuccess] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'success'>('cart');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({ name: 'Shrivarshinee K', street: '123 University Avenue', city: 'Chennai, TN', zip: '600001' });

  // Add item to shopping cart
  const handleAddToCart = (product: Product, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
    setIsCartOpen(true);
  };

  // Adjust cart quantity
  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  // Remove from cart
  const handleRemoveFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  // Cart values calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const taxRate = 0.08; // 8% sales tax
  const estimatedTax = cartSubtotal * taxRate;
  const deliveryFee = cartSubtotal > 49 ? 0 : 4.99;
  const cartTotal = cartSubtotal + estimatedTax + deliveryFee;

  // Handle mock checkout
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutStep('success');
    setCart([]);
  };

  // Filter & Sort Products
  const filteredProducts = LITERARY_PRODUCTS.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesStock = !showInStockOnly || product.inStock;
    return matchesSearch && matchesCategory && matchesStock;
  }).sort((a, b) => {
    if (sortOption === 'price-low') return a.price - b.price;
    if (sortOption === 'price-high') return b.price - a.price;
    if (sortOption === 'rating') return b.rating - a.rating;
    return 0; // featured
  });

  return (
    <div className="space-y-10 animate-fade-in" id="products-catalog-section">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-flex items-center px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-bold rounded-full tracking-wider uppercase border border-indigo-500/30">
            Premium Literary Goods
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Bookverse <span className="bg-gradient-to-r from-indigo-300 to-pink-200 bg-clip-text text-transparent">Boutique</span>
          </h1>
          <p className="text-indigo-100/90 text-sm sm:text-base leading-relaxed max-w-xl">
            Elevate your personal library atmosphere. Discover meticulously curated accessories, ambient decor, smart devices, and customized glassware handcrafted for passionate book lovers.
          </p>
          
          <div className="pt-3 flex flex-wrap gap-4 items-center">
            <span className="text-xs text-indigo-300/90 flex items-center">
              <ShieldCheck className="h-4 w-4 mr-1.5 text-emerald-400" /> Free Shipping on Orders Over $49
            </span>
            <span className="text-xs text-indigo-300/90 flex items-center">
              <Gift className="h-4 w-4 mr-1.5 text-pink-400" /> Complimentary Gift Wrapping
            </span>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-16 w-60 h-60 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Floating Cart Button */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="absolute top-6 right-6 p-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl border border-white/10 backdrop-blur-md transition-all flex items-center space-x-2 cursor-pointer shadow-lg group"
          id="boutique-cart-trigger"
        >
          <div className="relative">
            <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2.5 -right-2.5 bg-rose-500 text-white font-extrabold text-[10px] h-5 w-5 rounded-full flex items-center justify-center border-2 border-indigo-900 animate-pulse">
                {cartItemCount}
              </span>
            )}
          </div>
          <span className="hidden sm:inline font-bold text-xs">View Cart (${cartSubtotal.toFixed(2)})</span>
        </button>
      </div>

      {/* 2. Catalog controls */}
      <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700/60 rounded-3xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search accessories, candles, scanners..."
              className="block w-full pl-10 pr-4 py-3 text-xs bg-gray-50/50 dark:bg-slate-900/40 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 dark:text-white"
              id="boutique-search-input"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3.5 text-xs text-gray-400 hover:text-gray-600 font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filtering Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-1.5 bg-gray-50 dark:bg-slate-900/40 p-1.5 rounded-xl border border-gray-100 dark:border-slate-800">
              <span className="text-3xs text-gray-400 font-bold uppercase px-2">Sort By</span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="text-xs font-semibold bg-transparent border-0 focus:ring-0 cursor-pointer text-gray-700 dark:text-gray-300 pr-8"
              >
                <option value="featured">Featured Collection</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            <label className="flex items-center space-x-2 bg-gray-50 dark:bg-slate-900/40 px-3.5 py-2 rounded-xl border border-gray-100 dark:border-slate-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
              <input
                type="checkbox"
                checked={showInStockOnly}
                onChange={(e) => setShowInStockOnly(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
              />
              <span className="text-3xs font-bold text-gray-600 dark:text-gray-300">In Stock Only</span>
            </label>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
          <span className="text-3xs font-bold text-gray-400 uppercase tracking-widest mr-2 shrink-0">Departments:</span>
          {['All', 'Accessories', 'Smart Tech', 'Drinkware', 'Decor'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold tracking-tight transition-all cursor-pointer shrink-0 ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-50 dark:bg-slate-900/40 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat === 'All' ? 'All Products' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="boutique-products-grid">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            onClick={() => {
              setSelectedProduct(product);
              setCustomEngraving('');
            }}
            className="group bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer"
          >
            {/* Image Container with Badge */}
            <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              
              {/* Category Badge */}
              <span className="absolute top-3 left-3 px-2 py-0.5 bg-black/60 backdrop-blur-md text-white text-4xs font-bold uppercase tracking-wider rounded-md">
                {product.category}
              </span>

              {/* Out of Stock overlay */}
              {!product.inStock && (
                <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center">
                  <span className="px-3 py-1 bg-red-600 text-white text-xs font-extrabold rounded-xl uppercase tracking-widest">
                    Sold Out
                  </span>
                </div>
              )}
            </div>

            {/* Product Body Details */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                {/* Rating */}
                <div className="flex items-center space-x-1">
                  <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-3xs font-extrabold text-gray-700 dark:text-gray-300">{product.rating}</span>
                  <span className="text-4xs text-gray-400">({product.reviewCount} reviews)</span>
                </div>

                <h3 className="font-extrabold text-sm text-gray-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {product.name}
                </h3>
                <p className="text-3xs text-gray-400 dark:text-gray-400 line-clamp-2 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Purchase action row */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-slate-700/50">
                <span className="text-base font-black text-gray-950 dark:text-white">
                  ${product.price.toFixed(2)}
                </span>

                <button
                  onClick={(e) => {
                    if (product.inStock) {
                      handleAddToCart(product, e);
                    } else {
                      e.stopPropagation();
                    }
                  }}
                  disabled={!product.inStock}
                  className={`px-3 py-1.5 font-bold text-3xs rounded-xl flex items-center space-x-1 transition-all cursor-pointer ${
                    product.inStock
                      ? 'bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white dark:bg-indigo-950/40 dark:text-indigo-400 dark:hover:bg-indigo-600 dark:hover:text-white shadow-2xs'
                      : 'bg-gray-100 text-gray-400 dark:bg-slate-800 cursor-not-allowed opacity-50'
                  }`}
                >
                  <Plus className="h-3 w-3 mr-0.5" />
                  <span>Cart</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No results placeholder */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-20 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl space-y-3">
          <ShoppingBag className="h-10 w-10 text-gray-300 mx-auto" />
          <p className="text-sm font-medium text-gray-400 italic">No boutique items match your filter settings.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setShowInStockOnly(false);
            }}
            className="px-4 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* 4. Quick View Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-scale-up">
            
            {/* Close modal */}
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-5 right-5 p-2 bg-gray-50 hover:bg-gray-100 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-500 dark:text-gray-300 rounded-full transition-all cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Product Image Column */}
              <div className="space-y-4">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full aspect-square object-cover rounded-2xl shadow-sm border border-gray-50 dark:border-slate-700"
                  referrerPolicy="no-referrer"
                />

                <div className="bg-gray-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-gray-100/50 dark:border-slate-800/80 space-y-2">
                  <span className="text-4xs font-bold text-gray-400 uppercase tracking-widest block">Core Specifications:</span>
                  <ul className="space-y-1">
                    {selectedProduct.features.map((feature, i) => (
                      <li key={i} className="text-3xs text-gray-500 dark:text-gray-400 flex items-start space-x-1.5">
                        <Check className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Product Info Column */}
              <div className="flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <span className="text-4xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-md inline-block">
                    {selectedProduct.category}
                  </span>
                  
                  <h2 className="text-xl font-extrabold text-gray-900 dark:text-white leading-snug">
                    {selectedProduct.name}
                  </h2>

                  {/* Stars */}
                  <div className="flex items-center space-x-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-3.5 w-3.5 ${i < Math.floor(selectedProduct.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{selectedProduct.rating}</span>
                    <span className="text-2xs text-gray-400">({selectedProduct.reviewCount} customer reviews)</span>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {selectedProduct.description}
                  </p>

                  {/* Custom Engraving for leather bookmarks or specific customization */}
                  {selectedProduct.id === 'prod_bookmark' && (
                    <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-500/10 rounded-xl space-y-1.5">
                      <label className="text-3xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider block">
                        Custom Foil Engraving (Optional Initials)
                      </label>
                      <input
                        type="text"
                        maxLength={3}
                        value={customEngraving}
                        onChange={(e) => setCustomEngraving(e.target.value.toUpperCase())}
                        placeholder="E.g., SMK"
                        className="block w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                      />
                      <span className="text-[10px] text-gray-400 block">Up to 3 uppercase letters hot-foil pressed into the leather.</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-slate-700 space-y-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xs font-bold text-gray-400">Total Price</span>
                    <span className="text-2xl font-black text-gray-950 dark:text-white">${selectedProduct.price.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        if (selectedProduct.inStock) {
                          handleAddToCart(selectedProduct);
                          setSelectedProduct(null);
                        }
                      }}
                      disabled={!selectedProduct.inStock}
                      className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-100 disabled:text-gray-400 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>{selectedProduct.inStock ? 'Add to Cart' : 'Sold Out'}</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* 5. Checkout Shopping Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md h-full shadow-2xl flex flex-col justify-between animate-slide-left relative border-l border-gray-100 dark:border-slate-800">
            
            {/* Cart Header */}
            <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center space-x-2.5">
                <ShoppingCart className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-extrabold text-gray-900 dark:text-white text-base">Your Cart</h3>
                <span className="bg-indigo-100 text-indigo-800 text-3xs font-extrabold px-2 py-0.5 rounded-full">
                  {cartItemCount} items
                </span>
              </div>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setCheckoutStep('cart');
                }}
                className="p-1 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-500 rounded-lg cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Cart Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              
              {checkoutStep === 'cart' && (
                <>
                  {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-3">
                      <ShoppingBag className="h-12 w-12 text-gray-300" />
                      <p className="text-xs text-gray-400 italic">Your Bookverse boutique cart is empty.</p>
                      <button
                        onClick={() => setIsCartOpen(false)}
                        className="px-4 py-2 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl hover:bg-indigo-100 cursor-pointer"
                      >
                        Start Browsing
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div 
                          key={item.product.id}
                          className="flex items-center gap-4 bg-gray-50/50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 p-3.5 rounded-2xl"
                        >
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="h-14 w-14 object-cover rounded-xl border border-gray-100 dark:border-slate-700"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-extrabold text-gray-900 dark:text-white truncate">
                              {item.product.name}
                            </h4>
                            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                              ${item.product.price.toFixed(2)} each
                            </p>
                            
                            {/* Quantity buttons */}
                            <div className="flex items-center space-x-2.5 mt-2">
                              <button
                                onClick={() => handleUpdateQuantity(item.product.id, -1)}
                                className="p-1 bg-white dark:bg-slate-700 hover:bg-gray-100 rounded-md border border-gray-100 dark:border-slate-600 cursor-pointer"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{item.quantity}</span>
                              <button
                                onClick={() => handleUpdateQuantity(item.product.id, 1)}
                                className="p-1 bg-white dark:bg-slate-700 hover:bg-gray-100 rounded-md border border-gray-100 dark:border-slate-600 cursor-pointer"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </div>

                          <button
                            onClick={() => handleRemoveFromCart(item.product.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {checkoutStep === 'details' && (
                <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-1.5">
                    Shipping & Delivery Details
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-3xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.name}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                        className="block w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-3xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Street Address</label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.street}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                        className="block w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-3xs font-bold text-gray-400 uppercase tracking-wider block mb-1">City, State</label>
                        <input
                          type="text"
                          required
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                          className="block w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-3xs font-bold text-gray-400 uppercase tracking-wider block mb-1">ZIP / Postal Code</label>
                        <input
                          type="text"
                          required
                          value={shippingAddress.zip}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, zip: e.target.value })}
                          className="block w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-500/10 p-3.5 rounded-xl text-amber-800 dark:text-amber-400 text-3xs leading-relaxed space-y-1">
                    <span className="font-extrabold flex items-center">
                      <Info className="h-3 w-3 mr-1 shrink-0" /> Sandbox Demonstration Mode
                    </span>
                    <span>This checkout is simulated. No real credit card, Stripe authentication, or shipment is processed.</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <Check className="h-4 w-4" />
                    <span>Submit Sandbox Order</span>
                  </button>
                </form>
              )}

              {checkoutStep === 'success' && (
                <div className="text-center py-10 space-y-4 animate-scale-up">
                  <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-2xs">
                    <Check className="h-8 w-8" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white">Order Placed Successfully!</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      Thank you for your boutique order, <span className="font-extrabold">{shippingAddress.name}</span>! Your packing slip has been logged under your Bookverse history feed.
                    </p>
                  </div>
                  <div className="p-3.5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-left rounded-xl space-y-1 text-3xs text-gray-500 dark:text-gray-400">
                    <span className="font-bold text-gray-700 dark:text-gray-300 block">Deliver to:</span>
                    <span>{shippingAddress.street}</span>
                    <span className="block">{shippingAddress.city}, {shippingAddress.zip}</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setCheckoutStep('cart');
                    }}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Back to Boutique
                  </button>
                </div>
              )}

            </div>

            {/* Cart Footer */}
            {checkoutStep !== 'success' && cart.length > 0 && (
              <div className="p-6 border-t border-gray-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-4">
                <div className="space-y-1.5 text-2xs text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-gray-900 dark:text-white">${cartSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sales Tax (8%)</span>
                    <span>${estimatedTax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-xs font-black text-gray-950 dark:text-white border-t border-gray-100 dark:border-slate-800 pt-1.5">
                    <span>Estimated Total</span>
                    <span className="text-base text-indigo-600 dark:text-indigo-400 font-extrabold">${cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                {checkoutStep === 'cart' ? (
                  <button
                    onClick={() => setCheckoutStep('details')}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-xs"
                  >
                    <span>Proceed to Checkout</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setCheckoutStep('cart')}
                    className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Back to Edit Cart
                  </button>
                )}
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
