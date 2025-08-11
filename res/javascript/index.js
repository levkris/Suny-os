const firebaseConfig = {
    apiKey: "AIzaSyDq91dZ2X9MES8-q9pIctaBONgZwPF7X1o",
    authDomain: "homeassistant-23079.firebaseapp.com",
    projectId: "homeassistant-23079",
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();

auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "setup.html";
  }
});

