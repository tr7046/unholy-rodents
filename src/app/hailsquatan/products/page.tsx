'use client';

import { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';

interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
  sku?: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  images: string[];
  featured: boolean;
  tags: string[];
  variants: ProductVariant[];
}

interface ProductsData {
  products: Product[];
  shippingRates: {
    standard: { name: string; price: number; estimatedDays: string };
    express: { name: string; price: number; estimatedDays: string };
    freeShippingThreshold: number;
  };
}

const defaultProduct: Omit<Product, 'id'> = {
  name: '',
  slug: '',
  description: '',
  category: 'apparel',
  images: [],
  featured: false,
  tags: [],
  variants: [{ id: '', name: '', price: 0, stock: 0 }],
};

export default function ProductsAdminPage() {
  const [data, setData] = useState<ProductsData | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const res = await fetch('/api/admin/products');
    if (res.ok) {
      setData(await res.json());
    }
  }

  async function handleSave(product: Partial<Product>) {
    setSaving(true);
    try {
      const method = isCreating ? 'POST' : 'PUT';
      const res = await fetch('/api/admin/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });

      if (res.ok) {
        await fetchData();
        setEditingProduct(null);
        setIsCreating(false);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this product?')) return;

    await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
    await fetchData();
  }

  function formatPrice(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
  }

  function getTotalStock(product: Product): number {
    return product.variants.reduce((sum, v) => sum + v.stock, 0);
  }

  if (!data) {
    return <div className="text-[#888888]">Loading...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#f5f5f0]">Products</h1>
          <p className="text-[#888888] mt-1">{data.products.length} products</p>
        </div>
        <button
          onClick={() => {
            setIsCreating(true);
            setEditingProduct({ id: '', ...defaultProduct } as Product);
          }}
          className="flex items-center gap-2 bg-[#c41e3a] hover:bg-[#a01830] text-white px-4 py-2 rounded-lg transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* Products List */}
      <div className="bg-[#1a1a1a] border border-[#333] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#333]">
              <th className="text-left text-[#888888] text-sm font-medium px-6 py-4">Product</th>
              <th className="text-left text-[#888888] text-sm font-medium px-6 py-4">Category</th>
              <th className="text-left text-[#888888] text-sm font-medium px-6 py-4">Price</th>
              <th className="text-left text-[#888888] text-sm font-medium px-6 py-4">Stock</th>
              <th className="text-right text-[#888888] text-sm font-medium px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.products.map((product) => (
              <tr key={product.id} className="border-b border-[#333] last:border-0">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#252525] rounded-lg flex items-center justify-center overflow-hidden">
                      {product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <PhotoIcon className="w-6 h-6 text-[#666]" />
                      )}
                    </div>
                    <div>
                      <div className="text-[#f5f5f0] font-medium">{product.name}</div>
                      <div className="text-[#888888] text-sm">{product.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#252525] text-[#f5f5f0] capitalize">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-[#f5f5f0]">
                  {formatPrice(product.variants[0]?.price || 0)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`text-sm ${
                      getTotalStock(product) > 0 ? 'text-green-500' : 'text-[#c41e3a]'
                    }`}
                  >
                    {getTotalStock(product)} units
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditingProduct(product)}
                      className="p-2 text-[#888888] hover:text-[#f5f5f0] hover:bg-[#252525] rounded-lg transition-colors"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-[#888888] hover:text-[#c41e3a] hover:bg-[#252525] rounded-lg transition-colors"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <ProductModal
          product={editingProduct}
          isCreating={isCreating}
          saving={saving}
          onSave={handleSave}
          onClose={() => {
            setEditingProduct(null);
            setIsCreating(false);
          }}
        />
      )}
    </div>
  );
}

function ProductModal({
  product,
  isCreating,
  saving,
  onSave,
  onClose,
}: {
  product: Product;
  isCreating: boolean;
  saving: boolean;
  onSave: (product: Partial<Product>) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState(product);
  const [uploading, setUploading] = useState(false);

  function updateField(field: string, value: unknown) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function updateVariant(index: number, field: string, value: unknown) {
    const variants = [...formData.variants];
    variants[index] = { ...variants[index], [field]: value };
    setFormData((prev) => ({ ...prev, variants }));
  }

  function addVariant() {
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, { id: '', name: '', price: 0, stock: 0 }],
    }));
  }

  function removeVariant(index: number) {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    form.append('folder', 'products');

    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
      if (res.ok) {
        const { url } = await res.json();
        setFormData((prev) => ({ ...prev, images: [...prev.images, url] }));
      }
    } finally {
      setUploading(false);
    }
  }

  function removeImage(index: number) {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] border border-[#333] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#333] sticky top-0 bg-[#1a1a1a]">
          <h2 className="text-xl font-bold text-[#f5f5f0]">
            {isCreating ? 'Add Product' : 'Edit Product'}
          </h2>
          <button onClick={onClose} className="text-[#888888] hover:text-[#f5f5f0]">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-[#f5f5f0] mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-[#f5f5f0] focus:outline-none focus:border-[#c41e3a]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#f5f5f0] mb-2">Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => updateField('slug', e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-[#f5f5f0] focus:outline-none focus:border-[#c41e3a]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#f5f5f0] mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => updateField('category', e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-[#f5f5f0] focus:outline-none focus:border-[#c41e3a]"
              >
                <option value="apparel">Apparel</option>
                <option value="accessories">Accessories</option>
                <option value="bundles">Bundles</option>
                <option value="music">Music</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-[#f5f5f0] mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={3}
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-[#f5f5f0] focus:outline-none focus:border-[#c41e3a] resize-none"
              />
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-[#f5f5f0] mb-2">Images</label>
            <div className="flex flex-wrap gap-4">
              {formData.images.map((img, index) => (
                <div key={index} className="relative w-24 h-24 bg-[#252525] rounded-lg overflow-hidden">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 bg-[#c41e3a] rounded-full"
                  >
                    <XMarkIcon className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}
              <label className="w-24 h-24 border-2 border-dashed border-[#333] rounded-lg flex items-center justify-center cursor-pointer hover:border-[#c41e3a] transition-colors">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                {uploading ? (
                  <span className="text-[#888888] text-xs">Uploading...</span>
                ) : (
                  <PlusIcon className="w-8 h-8 text-[#666]" />
                )}
              </label>
            </div>
          </div>

          {/* Variants */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[#f5f5f0]">Variants</label>
              <button
                onClick={addVariant}
                className="text-sm text-[#c41e3a] hover:text-[#e63946]"
              >
                + Add Variant
              </button>
            </div>
            <div className="space-y-3">
              {formData.variants.map((variant, index) => (
                <div key={index} className="flex items-center gap-3 bg-[#0a0a0a] border border-[#333] rounded-lg p-3">
                  <input
                    type="text"
                    value={variant.name}
                    onChange={(e) => updateVariant(index, 'name', e.target.value)}
                    placeholder="Size/Variant"
                    className="flex-1 bg-transparent text-[#f5f5f0] focus:outline-none"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-[#888888]">$</span>
                    <input
                      type="number"
                      value={(variant.price / 100).toFixed(2)}
                      onChange={(e) => updateVariant(index, 'price', Math.round(parseFloat(e.target.value) * 100))}
                      step="0.01"
                      className="w-20 bg-transparent text-[#f5f5f0] focus:outline-none"
                    />
                  </div>
                  <input
                    type="number"
                    value={variant.stock}
                    onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                    placeholder="Stock"
                    className="w-20 bg-transparent text-[#f5f5f0] focus:outline-none"
                  />
                  {formData.variants.length > 1 && (
                    <button
                      onClick={() => removeVariant(index)}
                      className="text-[#888888] hover:text-[#c41e3a]"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Featured */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => updateField('featured', e.target.checked)}
              className="w-5 h-5 rounded border-[#333] bg-[#0a0a0a] text-[#c41e3a] focus:ring-[#c41e3a]"
            />
            <label htmlFor="featured" className="text-sm text-[#f5f5f0]">
              Featured product
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 p-6 border-t border-[#333]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[#888888] hover:text-[#f5f5f0] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            disabled={saving}
            className="px-6 py-2 bg-[#c41e3a] hover:bg-[#a01830] text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
