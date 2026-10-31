import '../admin/admin.css';

export const metadata = {
  title: 'Management Portal | PULLER',
  robots: { index: false, follow: false },
};

export default function ManagementPortalLayout({ children }) {
  return <div className="admin-body">{children}</div>;
}
