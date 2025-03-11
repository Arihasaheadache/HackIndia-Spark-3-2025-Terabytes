const SUPABASE_URL = "https://kjbpshbtznkftxxnlljl.supabase.co";
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY;
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", async () => {
    await fetchOptions();
});

async function fetchOptions() {
    let { data, error } = await supabase.from("profiles").select("position, languages, frameworks");
    if (error) return console.error("Error fetching data:", error);
    
    const positions = new Set(), languages = new Set(), frameworks = new Set();
    data.forEach(profile => {
        positions.add(profile.position);
        profile.languages.forEach(lang => languages.add(lang));
        profile.frameworks.forEach(framework => frameworks.add(framework));
    });
    populateDropdown("position", positions);
    populateDropdown("languages", languages);
    populateDropdown("frameworks", frameworks);
}

function populateDropdown(id, options) {
    const select = document.getElementById(id);
    options.forEach(option => {
        const opt = document.createElement("option");
        opt.value = option;
        opt.textContent = option;
        select.appendChild(opt);
    });
}

async function searchProfiles() {
    const position = document.getElementById("position").value;
    const selectedLanguages = Array.from(document.getElementById("languages").selectedOptions).map(opt => opt.value);
    const selectedFrameworks = Array.from(document.getElementById("frameworks").selectedOptions).map(opt => opt.value);

    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .or(`position.eq.${position}, languages.cs.{${selectedLanguages}}, frameworks.cs.{${selectedFrameworks}}`);
    
    if (error) return console.error("Error fetching profiles:", error);
    displayResults(data);
}

function displayResults(profiles) {
    const resultsContainer = document.getElementById("results");
    resultsContainer.innerHTML = "";
    
    if (profiles.length === 0) {
        resultsContainer.innerHTML = "<p>No profiles found.</p>";
        return;
    }

    profiles.forEach(profile => {
        const profileCard = document.createElement("div");
        profileCard.className = "profile-card";
        profileCard.innerHTML = `
            <h3>${profile.username}</h3>
            <p>Position: ${profile.position}</p>
            <p>Languages: ${profile.languages.join(", ")}</p>
            <p>Frameworks: ${profile.frameworks.join(", ")}</p>
        `;

        profileCard.addEventListener("click", () => {
            window.location.href = `chat.html?receiver_id=${profile.id}`;
        });

        resultsContainer.appendChild(profileCard);
    });
}
