// Test directo al endpoint
fetch("/api/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: "tecnico@taller.com",
    password: "tech123",
  }),
})
  .then((response) => {
    console.log("Status:", response.status);
    return response.json();
  })
  .then((data) => {
    console.log("Response:", data);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
