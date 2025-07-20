const tagsInput = document.getElementById("skillsInput");
const skillEntry = document.getElementById("skillEntry");
const hiddenSkills = document.getElementById("skills");

let skillsList = [];

skillEntry.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && skillEntry.value.trim() !== "") {
    e.preventDefault();
    const skill = skillEntry.value.trim();
    if (!skillsList.includes(skill)) {
      skillsList.push(skill);
      addSkillTag(skill);
      updateHiddenInput();
    }
    skillEntry.value = "";
  }
});

function addSkillTag(skill) {
  const tag = document.createElement("span");
  tag.className = "tag";
  tag.innerText = skill;

  const removeBtn = document.createElement("span");
  removeBtn.className = "remove-tag";
  removeBtn.innerText = "×";
  removeBtn.onclick = () => {
    tagsInput.removeChild(tag);
    skillsList = skillsList.filter(s => s !== skill);
    updateHiddenInput();
  };

  tag.appendChild(removeBtn);
  tagsInput.insertBefore(tag, skillEntry);
}

function updateHiddenInput() {
  hiddenSkills.value = skillsList.join(",");
}

document.getElementById("resumeForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  console.log("Submit button clicked");

  const file = document.getElementById("resumeFile").files[0];
  const skills = document.getElementById("skills").value;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("required_skills", skills);

  try {
    const response = await fetch("https://resume-matcher.onrender.com/match_resume/", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.error) {
      document.getElementById("result").innerHTML = `<p style="color:red;">Error: ${data.error}</p>`;
    } else {
      
        renderChart(data.match_score);
        document.getElementById("matchedSkills").innerText = data.matched_skills.join(", ") || "None";
        document.getElementById("missingSkills").innerText = data.missing_skills.join(", ") || "None";
        document.getElementById("reportSection").style.display = "block";
    }
  } catch (error) {
    document.getElementById("result").innerHTML = `<p style="color:red;">Backend unreachable. Is FastAPI running?</p>`;
    console.error("Fetch error:", error);
  }
});

function renderChart(score) {
  const ctx = document.getElementById("scoreChart").getContext("2d");

  // Destroy previous chart if it exists
  if (window.chart) window.chart.destroy();

  // Show score inside the doughnut manually using a plugin
  window.chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      datasets: [{
        data: [score, 100 - score],
        backgroundColor: ["#7E8B4A", "#2e2e2e"],
        borderWidth: 0,
      }]
    },
    options: {
      cutout: "70%",
      plugins: {
        tooltip: { enabled: false },
        legend: { display: false },
        // Custom text in center
        beforeDraw: function (chart) {
          const width = chart.width,
                height = chart.height,
                ctx = chart.ctx;
          ctx.restore();
          const fontSize = (height / 5).toFixed(2);
          ctx.font = fontSize + "px Segoe UI";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#ffffff";
          const text = score + "%",
                textX = Math.round((width - ctx.measureText(text).width) / 2),
                textY = height / 2;
          ctx.fillText(text, textX, textY);
          ctx.save();
        }
      }
    },
    plugins: [{
      id: 'textCenter',
      beforeDraw: (chart) => {
        const {width, height, ctx} = chart;
        ctx.restore();
        const fontSize = (height / 6).toFixed(2);
        ctx.font = `${fontSize}px Segoe UI`;
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        const text = `${score}%`;
        const textX = (width - ctx.measureText(text).width) / 2;
        const textY = height / 2;
        ctx.fillText(text, textX, textY);
        ctx.save();
      }
    }]
  });
  
}

// Update file name display when user selects a file
document.getElementById("resumeFile").addEventListener("change", function () {
  const fileName = this.files[0]?.name || "No file chosen";
  document.getElementById("fileName").textContent = fileName;
});
