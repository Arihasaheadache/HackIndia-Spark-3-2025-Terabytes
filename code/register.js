
function toggleFields() {
    let toggle = document.getElementById("roleToggle");
    let freelancerFields = document.getElementById("freelancer-fields");
    let businessFields = document.getElementById("business-fields");
    let roleInput = document.getElementById("role"); // Hidden input to store value
    let toggleLabel = document.getElementById("toggle-label");

    if (toggle.checked) {
        // Business selected
        freelancerFields.style.display = "none";
        businessFields.style.display = "block";
        roleInput.value = "business";
        toggleLabel.textContent = "Business";
    } else {
        // Freelancer selected
        freelancerFields.style.display = "block";
        businessFields.style.display = "none";
        roleInput.value = "freelancer";
        toggleLabel.textContent = "Freelancer";
    }
}
      
      function setStripeAccount() {
    // Simulating setting up Stripe (you can replace this with an actual integration)
    alert("Stripe account setup in progress...");
    
    // Set payment method value (if needed for backend processing)
    document.getElementById("paymentMethod").value = "Stripe";
    
    // Change button text to indicate it's set
    document.getElementById("stripeButton").textContent = "Stripe Account Set ✅";
    document.getElementById("stripeButton").disabled = true; // Disable button after setting up
}

const SUPABASE_URL = "https://kjbpshbtznkftxxnlljl.supabase.co";
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY;

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function registerUser(event) {
    event.preventDefault(); // Stop normal form submission

    // ✅ Make sure Supabase is initialized
    if (!supabase) {
      alert("Supabase failed to initialize. Please check your API keys.");
      return;
    }

    // Get form values
    const fullName = document.querySelector("input[placeholder='Full Name / Business Name']").value;
    const email = document.querySelector("input[placeholder='Email Address']").value;
    const password = document.querySelector("input[placeholder='Password']").value;
    const confirmPassword = document.querySelector("input[placeholder='Confirm Password']").value;
    const role = document.getElementById("role").value;
    const location = document.querySelector("input[placeholder='Country/City']").value;
    const availableFullTime = document.querySelector("input[name='fulltime']:checked").value === "yes";
    const timezone = document.querySelector("input[placeholder='Preferred Time Zone']").value;
    const bio = document.querySelector("textarea").value;
    const paymentMethod = document.getElementById("paymentMethod").value;

    // Freelancer Fields
    const skills = role === "freelancer" ? document.querySelector("select").value : null;
    const experience = role === "freelancer" ? parseInt(document.querySelector("input[placeholder='Years of Experience']").value) : null;
    const portfolioURL = role === "freelancer" ? document.querySelector("input[placeholder='Portfolio/Website Link']").value : null;
    const hourlyRate = role === "freelancer" ? parseFloat(document.querySelector("input[placeholder='Expected Hourly Rate ($)']").value) : null;

    // Business Fields
    const businessType = role === "business" ? document.querySelector("input[placeholder='Business Type']").value : null;
    const companyRegNumber = role === "business" ? document.querySelector("input[placeholder='Company Registration Number']").value : null;
    const companyAddress = role === "business" ? document.querySelector("input[placeholder='Company Address']").value : null;
    const companyWebsite = role === "business" ? document.querySelector("input[placeholder='Company Website']").value : null;

    // Check if passwords match
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    let { data: existingUser, error: checkError } = await supabase
    .from("profiles")
    .select("email")
    .eq("email", email)
    .single();

if (checkError && checkError.code !== "PGRST116") { // Ignore "no rows found" error
    console.error("Error checking email:", checkError.message);
    return;
}

if (existingUser) {
    alert("This email is already registered. Try logging in instead.");
    return;
}

    try {
      // ✅ Step 1: Sign up user in Supabase Auth
      let { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: fullName, // Temporary storage in auth metadata
            role,
          }
        }
      });

      if (error) throw error;
      const userId = data.user.id;

      // ✅ Step 2: Insert user profile into `profiles` table
      let { error: profileError } = await supabase.from("profiles").insert([
        {
          id: userId,
          username: fullName,
          email: email,
          role: role,
          location: location,
          available_fulltime: availableFullTime,
          timezone: timezone,
          bio: bio,
          payment_method: paymentMethod,
          skills: skills,
          experience: experience,
          portfolio_url: portfolioURL,
          hourly_rate: hourlyRate,
          business_type: businessType,
          company_reg_number: companyRegNumber,
          company_address: companyAddress,
          company_website: companyWebsite
        }
      ]);

      if (profileError) throw profileError;

      alert("Registration successful! Check your email for confirmation.");
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    }
  }