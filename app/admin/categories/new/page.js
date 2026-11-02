import CategoryForm from '@/components/admin/CategoryForm';

export default function NewCategoryPage() {
  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Add category</h1>
          <p>Set basics, then Section 01 (banner), Section 02 (intro), and Products — matching the website.</p>
        </div>
      </div>
      <div className="admin-panel">
        <CategoryForm />
      </div>
    </>
  );
}
