// Initiera Supabase-klienten
function getSupabaseClient() {
  if (window.supabaseClient) return window.supabaseClient;
  if (!window.supabase) {
    console.error("Supabase SDK missing.");
    return null;
  }
  var client = window.supabase.createClient(
    "https://upzfnjdqapkdgvhqxpsn.supabase.co",
    "sb_publishable_qIQ6hHDTH_i7mvJObG7Vog_Y4bLN22J"
  );
  window.supabaseClient = client;
  return client;
}

// Logga in användare
async function loginUser(email, password) {
  var client = getSupabaseClient();
  if (!client) {
    alert("Supabase client missing.");
    return;
  }
  const { data, error } = await client.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {
    alert("Kunde inte logga in: " + error.message);
    return;
  }

  alert("Inloggad! 🔐");
  window.location.href = "index.html"; 
}
