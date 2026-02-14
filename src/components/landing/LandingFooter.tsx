export function LandingFooter() {
  return (
    <footer className="border-t py-8">
      <div className="container mx-auto px-4 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Comanda. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
