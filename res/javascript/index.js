auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "setup.html";
  }
});

