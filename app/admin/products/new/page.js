import ProductForm from '@/components/admin/ProductForm';

export default function NewProductPage() {
  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Add product</h1>
          <p>Assign a category/subcategory and publish to show it on the website.</p>
        </div>
      </div>
      <div className="admin-panel">
        <ProductForm />
      </div>
    </>
  );
}
