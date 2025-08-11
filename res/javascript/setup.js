const firebaseConfig = {
    apiKey: "AIzaSyDq91dZ2X9MES8-q9pIctaBONgZwPF7X1o",
    authDomain: "homeassistant-23079.firebaseapp.com",
    projectId: "homeassistant-23079",
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

let page = localStorage.getItem("page") || 1;
renderPage();

window.onload = () => {
    auth.onAuthStateChanged(async (user) => {
        console.log("Auth state changed:", user);
        if (user) {
        await handleUser(user);
        page = localStorage.getItem("page") || 3;
        } else {
        page = 1;
        }
        renderPage();
    });

    document.querySelectorAll(".setup").forEach((element) => {
        const stepDiv = document.createElement("div");
        stepDiv.classList.add("frosted");
        stepDiv.classList.add("step");
        stepDiv.dataset.step = element.dataset.page;
        document.querySelector(".steps").appendChild(stepDiv);
    });
};

async function handleUser(user) {
    document.getElementById("profile-pic").src = user.photoURL;
    document.getElementById("user-name").textContent = user.displayName;
    document.getElementById("user-email").textContent = user.email;
    document.getElementById("device-name").value = user.displayName + "'s Suny OS Device";
    const userRef = db.collection("users").doc(user.uid);
    await userRef.set({
        name: user.displayName,
        email: user.email,
        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
}

let pin = [];

async function hashPIN(pinValue) {
  const encoder = new TextEncoder();
  const data = encoder.encode(pinValue);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

async function addDevice() {
  const deviceName = document.getElementById("device-name").value;
  const userPin = pin.join("");

  if (deviceName.length > 50) {
    deviceName = deviceName.slice(0, 50);
    console.warn("Device name trimmed to 50 characters");
  }
  
  if (deviceName.length < 3) {
    console.warn("Device name must be at least 3 characters");
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    console.error("No authenticated user");
    return;
  }

  try {
    const userRef = db.collection("users").doc(user.uid);

    let hashedPin = null;
    if (userPin && userPin.length === 4) {
      hashedPin = await hashPIN(userPin);
    }

    const deviceData = {
      user_agent: navigator.userAgent,
      device_name: deviceName,
      pin_hash: hashedPin,
      created_on: new Date().toISOString(),
      language: navigator.language,
      screen_resolution: `${window.screen.width}x${window.screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
      color_depth: window.screen.colorDepth,
      timezone_offset: new Date().getTimezoneOffset()
    };

    await userRef.set({
      devices: firebase.firestore.FieldValue.arrayUnion(deviceData)
    }, { merge: true });

    console.log("Device added successfully");
  } catch (err) {
    console.error("Error adding device:", err);
  }
}


function loginWithGoogle() {
  console.log("Login button clicked");
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(async (result) => {
      console.log("Popup sign-in result:", result);
      if (result.user) {
        await handleUser(result.user);
        page = 3;
        renderPage();
      }
    })
    .catch((error) => {
      console.error("Login failed:", error);
      const statusElem = document.querySelector(".status");
      if (statusElem) {
        statusElem.textContent = "Login failed, please try again.";
        statusElem.classList.remove("hidden");
        statusElem.classList.add("error");
      }
    });
}

function renderPage() {
  localStorage.setItem("page", page);
  document.querySelectorAll(".setup").forEach((element) => {
    if (element.dataset.page == page) {
      element.classList.add("showSetup");
      element.classList.remove("hideSetup");
    } else {
      element.classList.remove("showSetup");
      element.classList.add("hideSetup");
    }
  });

  document.querySelectorAll(".step").forEach((step) => {
    if (step.dataset.step < page) {
      step.classList.add("done");
    } else {
      step.classList.remove("done");
    }
    if (step.dataset.step == page) {
      step.classList.add("active");
    } else {
      step.classList.remove("active");
    }
  });
}

function logoutAndGoPage2() {
  auth.signOut().then(() => {
    page = 2;
    renderPage();
  }).catch((error) => {
    console.error("Sign out error:", error);
    page = 2;
    renderPage();
  });
}


function finishSetup() {
    addDevice();
    window.location.href = "/index.html";
    localStorage.removeItem("page");
}
function pinClicked(digit) {
    if (pin.length < 4) {
        pin.push(digit);
        updatePinCells();

        if (pin.length === 4) {
            document.getElementById("next-skip").textContent = "Next";
        } else {
            document.getElementById("next-skip").textContent = "Skip";
        }
    }
}

function removeLastPinDigit() {
    if (pin.length > 0) {
        pin.pop();
        updatePinCells();
    }

    if (pin.length === 4) {
        document.getElementById("next-skip").textContent = "Next";
    } else {
        document.getElementById("next-skip").textContent = "Skip";
    }
}

function updatePinCells() {
    for (let i = 1; i <= 4; i++) {
        const cell = document.getElementById(`pin-cell-${i}`);
        if (pin[i - 1] !== undefined) {
            cell.classList.add("filled");
        } else {
            cell.classList.remove("filled");
        }
    }
}