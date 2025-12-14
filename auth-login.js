// Initiera Supabase-klienten
const client = supabase.createClient(
  "https://upzfnjdqapkdgvhqxpsn.supabase.co",
  "sb_publishable_qIQ6hHDTH_i7mvJObG7Vog_Y4bLN22J"
);

// Logga in användare
async function loginUser(email, password) {
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
