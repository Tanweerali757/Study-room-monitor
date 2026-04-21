let currentUser = null;

async function checkAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  currentUser = session?.user || null;
  return currentUser;
}

async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  currentUser = data.user;
  return data;
}

async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  currentUser = null;
}

supabase.auth.onAuthStateChange((event, session) => {
  currentUser = session?.user || null;
  updateNavigation();
  const hash = window.location.hash.slice(1) || '/';
  handleRoute(hash);
});

function renderLoginForm() {
  return `
    <div class="auth-container">
      <h2>Sign In</h2>
      <form id="login-form">
        <label>Email <input type="email" id="login-email" required></label>
        <label>Password <input type="password" id="login-password" required></label>
        <div id="login-error" class="text-error" style="margin-bottom: 1rem;"></div>
        <button type="submit">Sign In</button>
      </form>
      <div class="auth-toggle">Don't have an account? <a id="show-signup">Sign Up</a></div>
    </div>
  `;
}

function renderSignupForm() {
  return `
    <div class="auth-container">
      <h2>Sign Up</h2>
      <form id="signup-form">
        <label>Email <input type="email" id="signup-email" required></label>
        <label>Password <input type="password" id="signup-password" required minlength="6"></label>
        <div id="signup-error" class="text-error" style="margin-bottom: 1rem;"></div>
        <button type="submit">Sign Up</button>
      </form>
      <div class="auth-toggle">Already have an account? <a id="show-login">Sign In</a></div>
    </div>
  `;
}

function updateNavigation() {
  const navMenu = document.getElementById('nav-menu');
  if (currentUser) {
    navMenu.innerHTML = `
      <li><a href="#/">🏠 Dashboard</a></li>
      <li><a href="#/report">📝 Report Issue</a></li>
      <li><span>👤 ${currentUser.email}</span></li>
      <li><a id="logout-btn" style="cursor: pointer;">🚪 Logout</a></li>
    `;
  } else {
    navMenu.innerHTML = `
      <li><a href="#/">Home</a></li>
      <li><a href="#/login">Login</a></li>
      <li><a href="#/signup">Sign Up</a></li>
    `;
  }
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await signOut();
      window.location.hash = '/';
    });
  }
}