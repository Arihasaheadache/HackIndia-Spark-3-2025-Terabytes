const SUPABASE_URL = "https://kjbpshbtznkftxxnlljl.supabase.co";
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY;
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let userRole = "";

// Fetch user data and determine role
async function fetchUserData() {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
        alert("User not found, please log in.");
        window.location.href = "login.html";
        return;
    }

    let { data, error } = await supabase.from("profiles").select("role").eq("id", userId).single();
    if (error || !data) {
        alert("Error fetching user data.");
        return;
    }

    userRole = data.role;
    document.getElementById("role-display").textContent = `You're logged in as a ${userRole}.`;

    if (userRole === "freelancer") {
        document.getElementById("freelancer-fields").style.display = "block";
    } else if (userRole === "business") {
        document.getElementById("business-fields").style.display = "block";
    }
}

// Dynamic Connection List
const availableConnections = ["GitHub", "LinkedIn", "Figma", "LeetCode"];
function addConnection() {
    const container = document.getElementById("connections-list");
    if (availableConnections.length === 0) return;

    const select = document.createElement("select");
    select.innerHTML = availableConnections.map(conn => `<option value="${conn}">${conn}</option>`).join(" ");
    const input = document.createElement("input");
    input.type = "url";
    input.placeholder = "Profile link";
    
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.onclick = () => {
        container.removeChild(div);
        availableConnections.push(select.value);
    };
    
    const div = document.createElement("div");
    div.appendChild(select);
    div.appendChild(input);
    div.appendChild(removeBtn);
    container.appendChild(div);
    
    availableConnections.splice(availableConnections.indexOf(select.value), 1);
}

// Dynamic Language and Framework Lists
function addItem(containerId) {
    const container = document.getElementById(containerId);
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Enter a value";
    
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.onclick = () => container.removeChild(div);
    
    const div = document.createElement("div");
    div.appendChild(input);
    div.appendChild(removeBtn);
    container.appendChild(div);
}

function addLanguage() { addItem("languages-list"); }
function addFramework() { addItem("frameworks-list"); }
function addSkill() { addItem("skills-list"); }

// Save user profile to Supabase
async function saveProfile() {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;

    let updateData = {};
    if (userRole === "freelancer") {
        updateData = {
            connections: Array.from(document.querySelectorAll("#connections-list select")).map(el => ({ type: el.value, link: el.nextElementSibling.value })),
            projects_worked_on: document.getElementById("projects").value,
            experience: document.getElementById("experience").value,
            previous_jobs: document.getElementById("previous-jobs").value,
            languages: Array.from(document.querySelectorAll("#languages-list input")).map(el => el.value),
            frameworks: Array.from(document.querySelectorAll("#frameworks-list input")).map(el => el.value),
            position: document.getElementById("position").value,
            bio: document.getElementById("bio").value
        };
    } else if (userRole === "business") {
        updateData = {
            business_industry: document.getElementById("industry").value,
            team_size: document.getElementById("team-size").value,
            years_in_business: document.getElementById("years-business").value,
            company_mission: document.getElementById("mission").value,
            company_website: document.getElementById("company-website").value,
            skills: Array.from(document.querySelectorAll("#skills-list input")).map(el => el.value),
            hiring_needs: document.getElementById("hiring-needs").value
        };
    }

    let { error } = await supabase.from("profiles").update(updateData).eq("id", userId);
    if (error) {
        alert("Error saving profile.");
    } else {
        let { error: updateError } = await supabase
        .from("profiles")
        .update({ first_login: false })
        .eq("id", userId);

    if (updateError) {
        console.error("Error updating first login status:", updateError);
    }
        alert("Profile saved successfully!");
        window.location.href = "dashboard.html";
       
    }
}

window.onload = fetchUserData;
