import { getMarkdownDocument } from '@/lib/markdown';
import { DocumentationLayout } from '@/components/DocumentationLayout';

export default async function TermsPage() {
  const doc = await getMarkdownDocument('terms');

  return (
    <DocumentationLayout
      content={doc.content}
      title={doc.title}
      description={doc.description}
    />
  );
}
