// Supabase client + nav auth UI
(function () {
  var env = window.MP_ENV || {};
  var SUPABASE_URL = env.supabaseUrl || '';
  var SUPABASE_ANON_KEY = env.supabaseAnonKey || env.supabasePublishableKey || '';

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Supabase env missing.');
    return;
  }

  function loadSupabase() {
    return new Promise(function (resolve, reject) {
      if (window.supabase) return resolve(window.supabase);
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      script.async = true;
      script.onload = function () {
        if (window.supabase) resolve(window.supabase);
        else reject(new Error('Supabase kunde inte laddas'));
      };
      script.onerror = function () {
        reject(new Error('Supabase-skriptet kunde inte laddas'));
      };
      document.head.appendChild(script);
    });
  }

  var mpReady =
    window.mpSupabaseReady ||
    loadSupabase().then(function (sb) {
      if (window.mpSupabase) return window.mpSupabase;
      var client = sb.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      window.mpSupabase = client;
      return client;
    });

  window.mpSupabaseReady = mpReady;

  mpReady
    .then(function (client) {
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

      function refresh() {
        client.auth
          .getSession()
          .then(function (sessionRes) {
            var loggedIn = Boolean(sessionRes && sessionRes.data && sessionRes.data.session);
            renderAuth(loggedIn);
          })
          .catch(function (err) {
            console.error('auth:session_error', err);
            renderAuth(false);
          });
      }

      refresh();

      if (logoutLink) {
        logoutLink.addEventListener('click', function (e) {
          e.preventDefault();
          client.auth
            .signOut()
            .catch(function (err) {
              console.error('auth:signout_error', err);
            })
            .finally(function () {
              renderAuth(false);
              window.location.href = '/';
            });
        });
      }

      client.auth.onAuthStateChange(function (_event, session) {
        var loggedIn = Boolean(session);
        renderAuth(loggedIn);
      });
    })
    .catch(function (err) {
      console.error('auth:init_error', err);
    });
})();
