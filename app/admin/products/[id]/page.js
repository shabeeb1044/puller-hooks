import ProductForm from '@/components/admin/ProductForm';

export default async function EditProductPage({ params }) {
  const { id } = await params;
  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Edit product</h1>
          <p>Update details, layout, and publish status.</p>
        </div>
      </div>
      <div className="admin-panel">
        <ProductForm productId={id} />
      </div>
    </>
  );
}
