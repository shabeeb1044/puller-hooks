import CategoryForm from '@/components/admin/CategoryForm';

export default async function EditCategoryPage({ params }) {
  const { id } = await params;
  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Edit category</h1>
          <p>Update name, page content, and navigation visibility.</p>
        </div>
      </div>
      <div className="admin-panel">
        <CategoryForm categoryId={id} />
      </div>
    </>
  );
}
