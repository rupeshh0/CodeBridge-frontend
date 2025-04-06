export function Footer() {
  return (
    <footer className="border-t border-gray-200 py-4">
      <div className="container mx-auto px-4 text-center">
        <p className="text-gray-500">© {new Date().getFullYear()} KodeLab. All rights reserved.</p>
      </div>
    </footer>
  );
}
