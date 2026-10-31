/**
 * Renders preserved HTML main content without design/content changes.
 */
export function HtmlMain({ html }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
