export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout is intentionally simple, without the main header and footer,
  // to provide a focused login experience.
  return <>{children}</>;
}
