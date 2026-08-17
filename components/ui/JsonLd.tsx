/**
 * Renders a schema.org JSON-LD block. Server component - render it inside the
 * page whose structured data it describes.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
