import DOMPurify from 'isomorphic-dompurify';

interface SafeContentProps {
  content: string;
  className?: string;
  allowedTags?: string[];
  allowedAttributes?: string[];
}

/**
 * SafeContent component for rendering user-generated HTML content securely.
 * Uses DOMPurify to sanitize content and prevent XSS attacks.
 */
export function SafeContent({
  content,
  className = '',
  allowedTags = ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre'],
  allowedAttributes = ['href', 'target', 'rel', 'src', 'alt', 'width', 'height', 'class', 'id']
}: SafeContentProps) {
  // Configure DOMPurify
  const cleanContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttributes,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'link', 'meta'],
    FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'onmouseout', 'onkeydown', 'onkeyup', 'onkeypress', 'style']
  });

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: cleanContent }}
    />
  );
}

/**
 * SafeText component for rendering plain text content with basic formatting.
 * Converts line breaks to <br> tags and sanitizes.
 */
export function SafeText({
  content,
  className = ''
}: {
  content: string;
  className?: string;
}) {
  // Convert line breaks to <br> tags and sanitize
  const formattedContent = content
    .replace(/\n/g, '<br>')
    .replace(/\r/g, '');

  const cleanContent = DOMPurify.sanitize(formattedContent, {
    ALLOWED_TAGS: ['br'],
    ALLOW_DATA_ATTR: false
  });

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: cleanContent }}
    />
  );
}

// Legacy export for backward compatibility
export function SafeContentLegacy({ text }: { readonly text: string }) {
  return <span>{text}</span>; // React auto-escapes
}