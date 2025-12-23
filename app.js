const signupForm = document.getElementById("signupForm");

if (signupForm) {
  signupForm.addEventListener("submit", signUp);
}

async function signUp(e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!name || !email || !password) {
    Swal.fire({
      icon: "error",
      title: "Oops!",
      text: "All Fields Are Required",
    });

    return;
  }

  try {
    const res = await axios.post(
      "http://localhost:3000/api/signup",
      { name, email, password },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("RESPONSE:", res);

    alert(res.data.message);
    window.location.href = "login.html";
  } catch (error) {
    console.log(error);

    if (error.response) {
      alert(error.response.data.message);
    } else {
      alert("Server not responding");
    }
  }
}

async function login(e) {
  try {
    e.preventDefault();

    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    if (email === "" || password === "") {
      alert("⚠️ Please fill in all fields before submitting!");
      return;
    } else if (email.indexOf("@gmail.com") === -1) {
      alert("Please enter a valid email address!");
      return;
    }

    const res = await axios.post(
      "http://localhost:3000/api/login",

      { email, password }
    );
    localStorage.setItem("token", res.data.token);

    let data = res.data;
    console.log(data);

    if (data.status === 404) {
      alert(data.message);
      return;
    }

    if (data.status === 401) {
      alert(data.message);
      return;
    }

    if (data.status === 200) {
      alert(data.message);
      window.location.href = "resume.html";
      return;
    }
  } catch (err) {
    console.log(err);
    alert("Not working");
  }
}
function goLogin(e) {
  e.preventDefault();
  window.location.href = "login.html";
}
function goSignUP(e) {
  e.preventDefault();
  window.location.href = "index.html";
}

// document.querySelector(".checkResult").style.display = "block";

async function resume() {
  let fileInput = document.getElementById("fileResume");

  if (!fileInput.files.length) {
    alert("Please select a PDF file");
    return;
  }

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  try {
    const res = await axios.post("http://localhost:3000/api/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    alert("Upload successful! Check console for AI result.");

    document.querySelector(".checkResult").style.display = "block";

    let data = res.data.aiAnalysis;

    let clean = data.replace(/```json|```/g, "").trim();
    let parsed = JSON.parse(clean);

    // console.log(parsed + "line 156");
    document.getElementById("resumeScore").innerText = parsed["Resume Score"];
    document.getElementById("atsScore").innerText = parsed["ATS Score"];

    const skillsList = document.getElementById("skillsList");
    skillsList.innerHTML = "";
    parsed["Missing Skills"].forEach((skill) => {
      skill = skill.replace(/\*/g, ""); // remove stars
      const li = document.createElement("li");
      li.textContent = skill;
      skillsList.appendChild(li);
    });

    // Suggestions
    const suggestionsContainer = document.getElementById(
      "suggestionsContainer"
    );
    suggestionsContainer.innerHTML = "";
    parsed["Suggestions"].forEach((txt) => {
      txt = txt.replace(/\*/g, "");
      const div = document.createElement("div");
      div.style.padding = "10px";
      div.style.margin = "10px 0";
      div.style.border = "1px solid #ddd";
      div.style.borderRadius = "8px";
      div.innerHTML = txt;
      suggestionsContainer.appendChild(div);
    });

    const resumeContainer = document.getElementById("resumeContainer");
    resumeContainer.innerHTML = "";

    let resumeText = parsed["Improved Resume Text"];
    let sections = resumeText.split("---");

    sections.forEach((section) => {
      section = section.replace(/\*/g, "");
      const div = document.createElement("div");
      div.style.border = "1px solid #ddd";
      div.style.padding = "12px";
      div.style.margin = "10px 0";
      div.style.borderRadius = "8px";
      div.style.whiteSpace = "pre-wrap";
      div.innerText = section.trim();
      resumeContainer.appendChild(div);
    });
  } catch (err) {
    console.error("Upload error:", err);
    alert("Upload failed! See console.");
  }
}
async function saveCVData() {
  let resumeText = document.getElementById("resumeContainer").innerText;

  try {
    const response = await axios.post(
      "http://localhost:3000/api/saveResume",

      { resumeText }
    );

    alert("Improved Resume Saved Successfully!");
    console.log(response.data);
  } catch (error) {
    console.error("Error saving resume:", error);
    alert("Error: Could not save resume.");
  }
}
async function download() {
  try {
    const { jsPDF } = window.jspdf;

    const res = await axios.get("http://localhost:3000/api/getResume");
    const text = res.data.resumeText;

    console.log("✅ ResumeText Length:", text.length);

    const pdf = new jsPDF({
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    });

    const marginX = 15;
    const marginY = 20;
    const maxWidth = 180;

    pdf.setFont("Times", "Normal");
    pdf.setFontSize(11);

    const lines = pdf.splitTextToSize(text, maxWidth);

    pdf.text(lines, marginX, marginY);
    pdf.save("resume.pdf");
  } catch (err) {
    console.error("PDF ERROR:", err);
    alert("PDF download failed");
  }
}
const jobForm = document.getElementById("jobForm");
jobForm.addEventListener("submit", addJob);
const token = localStorage.getItem("token");
if (!token) {
  alert("Login first!");
  window.location.href = "login.html";
}
async function addJob(e) {
  e.preventDefault();

  const jobData = {
    company: company.value,
    position: position.value,
    jobDescription: jobDescription.value,
    appliedDate: appliedDate.value,
    status: status.value,
    notes: notes.value,
  };

  try {
    const res = await axios.post("http://localhost:3000/api/jobs", jobData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    alert(res.data.message || "Job added");
    jobForm.reset();
    getJobs();
  } catch (err) {
    console.log(err);
    alert(err.response?.data?.message || "Add failed");
  }
}

// function renderJobs(jobs) {
//   const div = document.getElementById("jobs");
//   div.innerHTML = "";

//   jobs.forEach(job => {
//     div.innerHTML += `
//       <div class="job">
//         <h3>${job.company} - ${job.position}</h3>
//         <p>Status: <b>${job.status}</b></p>
//         <p>${job.jobDescription || ""}</p>
//         <button onclick="updateJob('${job._id}')">Update</button>
//         <button onclick="deleteJob('${job._id}')">Delete</button>
//       </div>
//     `;
//   });
// }

function getStatusIcon(status) {
  if (status === "Applied") return "📨";
  if (status === "Interviewing") return "📞";
  if (status === "Offered") return "🎉";
  if (status === "Rejected") return "❌";
  return "";
}

function renderJobs(jobs) {
  const div = document.getElementById("jobsContainer");
  div.innerHTML = "";

  jobs.forEach((job) => {
    div.innerHTML += `
      <div class="job">
        <h3>${job.company} — ${job.position}</h3>

        <span class="status ${job.status}">
          ${getStatusIcon(job.status)} ${job.status}
        </span>

        <select id="status-${job._id}">
          <option value="Applied" ${
            job.status === "Applied" ? "selected" : ""
          }>Applied</option>
          <option value="Interviewing" ${
            job.status === "Interviewing" ? "selected" : ""
          }>Interviewing</option>
          <option value="Offered" ${
            job.status === "Offered" ? "selected" : ""
          }>Offered</option>
          <option value="Rejected" ${
            job.status === "Rejected" ? "selected" : ""
          }>Rejected</option>
        </select>

        <div style="margin-top:10px">
          <button onclick="updateJob('${job._id}')">💾 Save</button>
          <button onclick="deleteJob('${job._id}')">🗑 Delete</button>
        </div>
      </div>
    `;
  });
}

async function getJobs() {
  console.log("TOKEN:", token);

  try {
    const res = await axios.get("http://localhost:3000/api/jobs/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    renderJobs(res.data.jobs);
  } catch (err) {
    console.error(err);
    alert("Failed to fetch jobs");
  }
}

getJobs();

async function updateJob(id) {
  const newStatus = document.getElementById(`status-${id}`).value;

  try {
    await axios.put(
      `http://localhost:3000/api/jobs/${id}`,
      { status: newStatus },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    alert("Job updated successfully");
    getJobs();
  } catch (err) {
    alert("Update failed");
  }
}

async function deleteJob(id) {
  if (!confirm("Delete this job?")) return;

  try {
    await axios.delete(`http://localhost:3000/api/jobs/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    alert("Job deleted");
    getJobs();
  } catch (err) {
    alert("Delete failed");
  }
}
