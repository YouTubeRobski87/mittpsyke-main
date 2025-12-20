// Skapa Supabase-klienten
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

// Registrera användare
async function registerUser(email, password) {
  var client = getSupabaseClient();
  if (!client) {
    alert("Supabase client missing.");
    return;
  }
  try {
    const { data, error } = await client.auth.signUp({
      email: email,
      password: password
    });

    if (error) {
      alert("Kunde inte skapa konto: " + error.message);
      console.error("Signup error:", error);
      return;
    }

    alert("Konto skapat! 🎉 Du kan nu logga in.");
    window.location.href = "login.html";

  } catch (err) {
    alert("Tekniskt fel: " + err.message);
    console.error("Fetch error:", err);
  }
}
