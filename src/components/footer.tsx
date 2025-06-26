
export function Footer() {
  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto py-6 px-4 md:px-8 flex flex-col md:flex-row items-center justify-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Outpost. All rights reserved.</p>
      </div>
    </footer>
  );
}
