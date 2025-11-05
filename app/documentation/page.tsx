import { getMarkdownDocument } from '@/lib/markdown';
import { DocumentationLayout } from '@/components/DocumentationLayout';

export default async function DocumentationPage() {
  const doc = await getMarkdownDocument('documentation');

  return (
    <DocumentationLayout
      content={doc.content}
      title={doc.title}
      description={doc.description}
    />
  );
}
