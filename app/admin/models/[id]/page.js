import ProductForm from '@/components/admin/ProductForm';

export default async function EditModelPage({ params }) {
  const { id } = await params;
  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Edit model</h1>
          <p>Update model details and publish status.</p>
        </div>
      </div>
      <div className="admin-panel">
        <ProductForm productId={id} mode="model" />
      </div>
    </>
  );
}
