// Supabase client + nav auth UI
(function () {
  if (!window.supabase) return;

  var SUPABASE_URL = 'https://upzfnjdqapkdgvhqxpsn.supabase.co';
  var SUPABASE_ANON_KEY = 'sb_publishable_qIQ6hHDTH_i7mvJObG7Vog_Y4bLN22J';

  var client = window.mpSupabase || supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  window.mpSupabase = client;

  var loginLink = document.querySelector('.auth-login');
  var logoutLink = document.querySelector('.auth-logout');
  var statusEl = document.querySelector('.auth-status');

  function renderAuth(isLoggedIn) {
    if (isLoggedIn) {
      if (loginLink) loginLink.style.display = 'none';
      if (logoutLink) logoutLink.style.display = '';
      if (statusEl) statusEl.style.display = '';
    } else {
      if (loginLink) loginLink.style.display = '';
      if (logoutLink) logoutLink.style.display = 'none';
      if (statusEl) statusEl.style.display = 'none';
    }
  }

  async function refresh() {
    var sessionRes = await client.auth.getSession();
    var loggedIn = Boolean(sessionRes?.data?.session);
    renderAuth(loggedIn);
  }

  refresh();

  if (logoutLink) {
    logoutLink.addEventListener('click', function (e) {
      e.preventDefault();
      client.auth.signOut().finally(function () {
        renderAuth(false);
        window.location.href = '/';
      });
    });
  }

  client.auth.onAuthStateChange(function () {
    refresh();
  });
})();
