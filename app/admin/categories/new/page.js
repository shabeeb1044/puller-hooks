import CategoryForm from '@/components/admin/CategoryForm';

export default function NewCategoryPage() {
  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Add category</h1>
          <p>New categories appear in the Products dropdown when visible.</p>
        </div>
      </div>
      <div className="admin-panel">
        <CategoryForm />
      </div>
    </>
  );
}
