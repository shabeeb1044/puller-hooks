import SubcategoryForm from '@/components/admin/SubcategoryForm';

export default async function EditSubcategoryPage({ params }) {
  const { id } = await params;
  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Edit subcategory</h1>
          <p>Update nesting, page content, and visibility.</p>
        </div>
      </div>
      <div className="admin-panel">
        <SubcategoryForm subcategoryId={id} />
      </div>
    </>
  );
}
