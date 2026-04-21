const routes = {
  '/': { title: 'Dashboard', render: renderDashboard, auth: false },
  '/login': {
    title: 'Sign In',
    render: () => {
      if (currentUser) { window.location.hash = '/'; return; }
      document.getElementById('view-container').innerHTML = renderLoginForm();
      attachAuthListeners();
    },
    auth: false
  },
  '/signup': {
    title: 'Sign Up',
    render: () => {
      if (currentUser) { window.location.hash = '/'; return; }
      document.getElementById('view-container').innerHTML = renderSignupForm();
      attachAuthListeners();
    },
    auth: false
  },
  '/report': { title: 'Report Issue', render: renderReportPage, auth: true }
};

async function handleRoute(path) {
  if (!path || path === '') path = '/';
  const route = routes[path];
  if (!route) { window.location.hash = '/'; return; }
  await checkAuth();
  if (route.auth && !currentUser) { window.location.hash = '/login'; return; }
  document.title = `${route.title} - Study Room Monitor`;
  route.render();
}

function attachAuthListeners() {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      const errorDiv = document.getElementById('login-error');
      try {
        await signIn(email, password);
        window.location.hash = '/';
      } catch (error) {
        errorDiv.textContent = error.message || 'Login failed.';
      }
    });
  }
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;
      const errorDiv = document.getElementById('signup-error');
      try {
        await signUp(email, password);
        alert('Sign up successful! Check your email.');
        window.location.hash = '/login';
      } catch (error) {
        errorDiv.textContent = error.message || 'Signup failed.';
      }
    });
  }
  document.getElementById('show-signup')?.addEventListener('click', () => window.location.hash = '/signup');
  document.getElementById('show-login')?.addEventListener('click', () => window.location.hash = '/login');
}

function initRouter() {
  window.addEventListener('hashchange', () => {
    handleRoute(window.location.hash.slice(1) || '/');
  });
  handleRoute(window.location.hash.slice(1) || '/');
}

initRouter();
updateNavigation();