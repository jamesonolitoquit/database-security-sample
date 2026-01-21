export function SafeContent({ text }: { text: string }) {
  return <span>{text}</span>; // React auto-escapes
}