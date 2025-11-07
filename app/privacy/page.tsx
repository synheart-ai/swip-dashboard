import { getMarkdownDocument } from '@/lib/markdown';
import { DocumentationLayout } from '@/components/DocumentationLayout';

export default async function PrivacyPage() {
  const doc = await getMarkdownDocument('privacy');

  return (
    <DocumentationLayout
      content={doc.content}
      title={doc.title}
      description={doc.description}
    />
  );
}
