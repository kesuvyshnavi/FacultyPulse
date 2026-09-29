// ===============================
// (a) Linking External JavaScript
// ===============================

alert("Welcome to FacultyPulse Student Dashboard!");


// ===============================
// (b) DOM Selectors
// ===============================

document.getElementById("title").style.color = "#4f46e5";

document.querySelector(".heading").style.fontStyle = "italic";

document.querySelectorAll("label").forEach(function (label) {
  label.style.color = "#333";
});


// ===============================
// (c) Event Listener
// ===============================

document.getElementById("submitBtn").addEventListener("click", submitFeedback);


// ===============================
// (e) Function Declaration
// ===============================

function submitFeedback() {
  let comment = document.getElementById("comments").value;

  if (comment == "") {
    alert("Please enter your feedback.");
    return;
  }

  document.getElementById("status").innerHTML = "Submitted";
  document.getElementById("status").style.color = "green";
  document.getElementById("message").innerHTML = "Thank you for submitting your feedback!";
}


// ===============================
// (d) Button Click Event
// ===============================

function viewStatus() {
  let faculty = document.getElementById("faculty").value;
  let subject = document.getElementById("subject").value;

  alert(
    "Faculty : " + faculty +
    "\nSubject : " + subject +
    "\nStatus : " +
    document.getElementById("status").innerHTML
  );
}


// ===============================
// (d) Button Click Event
// ===============================

function resetForm() {
  document.getElementById("comments").value = "";
  document.getElementById("status").innerHTML = "Pending";
  document.getElementById("status").style.color = "red";
  document.getElementById("message").innerHTML = "Waiting for your valuable feedback...";
}


// ===============================
// (e) Function Expression
// ===============================

const feedbackSummary = function () {
  alert("Feedback Summary Generated Successfully!");
};


// ===============================
// (e) Arrow Function
// ===============================

const thankYouMessage = () => {
  alert("Thank you for using FacultyPulse!");
};


// ===============================
// (e) Calling all Functions
// ===============================

function showFunctions() {
  feedbackSummary();
  thankYouMessage();
}
