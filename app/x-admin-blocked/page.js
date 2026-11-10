import { notFound } from 'next/navigation';

/** Internal target for middleware: public /admin requests resolve here → real 404. */
export default function AdminBlockedPage() {
  notFound();
}
