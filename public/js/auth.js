// ===== Convertly Auth Logic =====

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Check Auth Status on Load
  try {
    const res = await fetch('/api/auth/me');
    if (!res.ok) {
      const text = await res.text();
      console.warn('Auth check failed with status:', res.status, text.substring(0, 100));
      enforceAuthGate(false);
      return;
    }
    const data = await res.json();

    if (data.loggedIn && data.user) {
      updateNavbarForLoggedInUser(data.user);
      enforceAuthGate(true, data.user);
    } else {
      enforceAuthGate(false);
    }
  } catch (err) {
    console.error('Failed to check auth status:', err.message);
    enforceAuthGate(false);
  }

  // 2. Setup Signup Form
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });

        let data;
        try {
          data = await res.json();
        } catch (e) {
          const text = await res.text();
          console.error('Signup response was not JSON:', text.substring(0, 200));
          throw new Error('Server returned invalid response. Please check if the backend is running.');
        }

        if (data.success) {
          window.location.href = '/index.html';
        } else {
          alert('Signup failed: ' + (data.error || 'Unknown error'));
        }
      } catch (err) {
        alert('Signup error: ' + err.message);
      }
    });
  }

  // 3. Setup Login Form
  const signinForm = document.getElementById('signinForm');
  if (signinForm) {
    signinForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        let data;
        try {
          data = await res.json();
        } catch (e) {
          const text = await res.text();
          console.error('Login response was not JSON:', text.substring(0, 200));
          throw new Error('Server returned invalid response. Please check if the backend is running.');
        }

        if (data.success) {
          window.location.href = '/index.html';
        } else {
          alert('Login failed: ' + (data.error || 'Unknown error'));
        }
      } catch (err) {
        alert('Login error: ' + err.message);
      }
    });
  }
});

function updateNavbarForLoggedInUser(user) {
  const navActions = document.querySelector('.nav-actions');
  if (!navActions) return; // Might be on an auth page itself with a simplified navbar
  
  navActions.innerHTML = `
    <div class="dropdown">
      <a href="#" class="nav-link profile-link">
        <img src="${user.avatarUrl || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}" alt="${user.name}" class="nav-avatar">
        <span>Hi, ${user.name.split(' ')[0]}</span> ▾
      </a>
      <div class="dropdown-menu">
        <a href="/account-settings.html">Account Settings</a>
        <a href="#" id="logoutBtn" style="color:var(--primary-red); font-weight:600;">Log out</a>
      </div>
    </div>
  `;

  document.getElementById('logoutBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.reload();
    } catch (err) {
      console.error('Logout failed', err);
    }
  });
}

function enforceAuthGate(isLoggedIn, user = null) {
  const membersOnlyEl = document.querySelector('[data-members-only="true"]');
  if (!membersOnlyEl) return; // Not a gated page

  if (!isLoggedIn) {
    // Blur the content
    membersOnlyEl.style.filter = 'blur(8px)';
    membersOnlyEl.style.pointerEvents = 'none';
    membersOnlyEl.style.userSelect = 'none';

    // Inject lock screen
    const lockScreen = document.createElement('div');
    lockScreen.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.7); backdrop-filter: blur(4px); z-index: 9999; display: flex; align-items: center; justify-content: center;">
        <div style="background: white; padding: 40px; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); max-width: 450px; text-align: center; border: 1px solid #eee; animation: slideUpFade 0.4s ease-out;">
          <div style="width: 64px; height: 64px; background: #fff1f0; color: #E5322D; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <h2 style="font-size: 1.8rem; font-weight: 800; color: #2d2d2d; margin-bottom: 15px;">Members Only Tool</h2>
          <p style="color: #6b7280; line-height: 1.6; margin-bottom: 25px; font-size: 1.05rem;">
            This is a premium Next-Level feature! It is 100% free, but requires a quick account to track API usage and save your results.
          </p>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <a href="/signup.html" style="background: #E5322D; color: white; padding: 14px 24px; border-radius: 8px; font-weight: 600; text-decoration: none; transition: transform 0.2s;">Create Free Account</a>
            <a href="/signin.html" style="background: #f3f4f6; color: #4b5563; padding: 14px 24px; border-radius: 8px; font-weight: 600; text-decoration: none; transition: background 0.2s;">I already have an account</a>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(lockScreen);
  } else {
    // Show a small welcome toast or tracking success
    console.log("User authorized to use premium tool.");
  }
}
