function toggleFields() {
  let toggle = document.getElementById("roleToggle");
  let roleInput = document.getElementById("role"); // Hidden input to store value
  let toggleLabel = document.getElementById("toggle-label");

  if (toggle.checked) {
      roleInput.value = "business";
      toggleLabel.textContent = "Business";
  } else {
      roleInput.value = "freelancer";
      toggleLabel.textContent = "Freelancer";
  }
}

const SUPABASE_URL = "https://kjbpshbtznkftxxnlljl.supabase.co";
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY;
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function registerUser(event) {
  event.preventDefault(); // Prevent form submission

  if (!supabase) {
      alert("Supabase failed to initialize. Please check your API keys.");
      return;
  }

  // Get form values
  const username = document.querySelector("input[placeholder='Username']").value.trim();
  const email = document.querySelector("input[placeholder='Email Address']").value.trim();
  const password = document.querySelector("input[placeholder='Password']").value;
  const role = document.getElementById("role").value;

  if (!username || !email || !password) {
      alert("Please fill in all fields.");
      return;
  }

  try {
      // Sign up user in Supabase Auth
      let { data, error } = await supabase.auth.signUp({
          email,
          password
      });

      if (error) throw error;
      const userId = data.user.id; // Get user ID from Supabase Auth

      // Insert user data into profiles table
      let { error: profileError } = await supabase
          .from("profiles")
          .insert([
              {
                  id: userId, // Same ID as auth.users
                  email: email,
                  username: username,
                  role: role,
                  first_login: true // Set first_login flag
              }
          ]);

      if (profileError) {
          console.error("Error inserting profile:", profileError);
          alert("Profile creation failed.");
          return;
      }

      alert("Registration successful! Check your email for confirmation.");
      window.location.href = "login.html";
  } catch (err) {
      console.error("Registration error:", err);
      alert("Error: " + err.message);
  }
}

// Attach register function to form submission
document.getElementById("registerForm").addEventListener("submit", registerUser);
