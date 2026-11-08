import ProductForm from '@/components/admin/ProductForm';

export default function NewModelPage() {
  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Add model</h1>
          <p>Name-button models appear in Available Models above the product catalog.</p>
        </div>
      </div>
      <div className="admin-panel">
        <ProductForm mode="model" />
      </div>
    </>
  );
}
