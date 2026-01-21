export function SafeContent({ text }: { readonly text: string }) {
  return <span>{text}</span>; // React auto-escapes
}