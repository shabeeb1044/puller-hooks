import SubcategoryForm from '@/components/admin/SubcategoryForm';

export default function NewSubcategoryPage() {
  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Add subcategory</h1>
          <p>Appears under its parent category in the Products menu when visible.</p>
        </div>
      </div>
      <div className="admin-panel">
        <SubcategoryForm />
      </div>
    </>
  );
}
