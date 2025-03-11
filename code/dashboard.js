const SUPABASE_URL = "https://kjbpshbtznkftxxnlljl.supabase.co";
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY;
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fetchUserData() {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
        alert("User not logged in. Redirecting to login page.");
        window.location.href = "index.html";
        return;
    }

    try {
        let { data: profile, error } = await supabase
            .from("profiles")
            .select("username, role, position, experience, projects_worked_on, previous_jobs, languages, frameworks, bio")
            .eq("id", userId)
            .single();

        if (error || !profile) {
            console.error("Error fetching profile data:", error);
            return;
        }

        // Update the UI with user data
        document.getElementById("user-name").textContent = profile.username;
        document.getElementById("dashboard-username").textContent = profile.username;
        document.getElementById("user-position").textContent = profile.position || "Unknown Position";
        
        document.getElementById("years-exp").textContent = profile.experience || 0;
        document.getElementById("prev-projects").textContent = profile.projects_worked_on || 0;
        document.getElementById("prev-jobs").textContent = profile.previous_jobs || 0;

        document.getElementById("languages").textContent = profile.languages?.join(", ") || "Fluent in Binary";
        document.getElementById("frameworks").textContent = profile.frameworks?.join(", ") || "Still figuring out HTML";
        document.getElementById("bio").textContent = profile.bio || "Just a mysterious entity wandering the web...";
    } catch (err) {
        console.error("Error fetching user data:", err);
    }
}

document.addEventListener("DOMContentLoaded", fetchUserData);
