const SUPABASE_URL = "https://kjbpshbtznkftxxnlljl.supabase.co";
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY;

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function login() {
    const identifier = document.getElementById("loginIdentifier").value.trim();
    const password = document.getElementById("password").value;

    if (!identifier || !password) {
        alert("Please enter both email/username and password.");
        return;
    }

    try {
        let { data, error } = await supabase.auth.signInWithPassword({
            email: identifier.includes("@") ? identifier : null,
            password,
        });

        // If login with email fails, try using username
        if (error && !identifier.includes("@")) {
            let { data: userRecord, error: userError } = await supabase
                .from("profiles")
                .select("email")
                .eq("username", identifier)
                .single();

            if (userError || !userRecord) {
                alert("Invalid credentials. Please try again.");
                return;
            }

            // Try logging in again with found email
            ({ data, error } = await supabase.auth.signInWithPassword({
                email: userRecord.email,
                password,
            }));
        }

        if (error) {
            alert("Invalid credentials. Please try again.");
            return;
        }

        const user = data.user;
        const userId = user.id;
        localStorage.setItem("user_id", userId);

        // ✅ Fetch user profile data
        let { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("first_login, username")
            .eq("id", userId)
            .single();

        if (profileError || !profile) {
            console.error("Error fetching profile:", profileError);
            alert("An error occurred while retrieving your profile.");
            return;
        }

        if (profile.first_login) {
            // Update first_login to false
           
            // Redirect to info.html
            window.location.href = `info.html?user=${encodeURIComponent(profile.username)}`;
        } else {

            window.location.href = `dashboard.html?user=${encodeURIComponent(profile.username)}`;
        }
    } catch (err) {
        console.error("Error logging in:", err);
        alert("An error occurred. Please try again.");
    }
}

// Expose login function globally
window.login = login;
