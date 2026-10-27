const Navbar = () => {
  return (
    <header className="navbar">
      <div className="navbar-container">

        <a href="/" className="logo">
          <span className="logo-mark">R</span>
          <span className="logo-text">RECALLDOSE</span>
        </a>

        <nav className="nav-links">
          <a href="#features">Features</a>
          <a href="#exams">Exams</a>
          <a href="#how-it-works">How it works</a>
        </nav>

        <div className="nav-actions">
          <a href="/login" className="login-link">
            Log in
          </a>

          <a href="/register" className="nav-button">
            Start your journey
          </a>
        </div>

      </div>
    </header>
  );
};

export default Navbar;