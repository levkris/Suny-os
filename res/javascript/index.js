const firebaseConfig = {
    apiKey: "AIzaSyDq91dZ2X9MES8-q9pIctaBONgZwPF7X1o",
    authDomain: "homeassistant-23079.firebaseapp.com",
    projectId: "homeassistant-23079",
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

auth.onAuthStateChanged(user => {
    if (!user || !localStorage.getItem("device_id") || localStorage.getItem("device_id") === "null" || localStorage.getItem("device_id") === "undefined") {
        window.location.href = "setup.html";
    }
    if(user) {
        window.currentUserId = user.uid;
    }
});

let entered_pin = [];

document.addEventListener("DOMContentLoaded", async () => {
    let lockscreen = document.getElementById("lockscreen");
    let lockscreenContent = lockscreen.querySelector(".lockscreen-content");
    let lockscreenBottom = lockscreen.querySelector(".lockscreen-bottom");
    let lockscreenUnlockingContent = lockscreen.querySelector(".lockscreen-unlocking-content");

    let lockscreenStateIcon = lockscreen.querySelector(".lockscreen-state-icon");

    let homescreen = document.getElementById("homescreen");
    lockscreenUnlockingContent.style.transform = `translateY(-${window.innerHeight}px)`;

    let startY = 0;
    let currentY = 0;
    let isDragging = false;
    let phoneState = "locked";
    let threshold = 250;
    let maxBlur = parseFloat(getComputedStyle(document.documentElement)
                     .getPropertyValue("--blur")) || 6.86;

    let hasPin = await checkPinStatus();

    if (!hasPin) {
        lockscreenStateIcon.textContent = "lock_open";
    }
        

    function setTranslateY(value) {
        if (hasPin) {
            lockscreenContent.style.transform = `translateY(${value}px)`;
            lockscreenBottom.style.transform = `translateY(${value}px)`;
            lockscreenUnlockingContent.style.transform = `translateY(${value}px)`;
        } else {
            lockscreen.style.transform = `translateY(${value}px)`;
        }
    }

    function resetUnlockingContentPosition() {
        if (phoneState === "locked") {
            lockscreenUnlockingContent.style.transform = `translateY(${window.innerHeight}px)`;
        } else if (phoneState === "unlocking") {
            lockscreenUnlockingContent.style.transform = `translateY(0)`;
        }
    }

    resetUnlockingContentPosition();

    lockscreen.addEventListener("touchstart", e => {
        isDragging = true;
        startY = e.touches[0].clientY;
        lockscreen.style.transition = "none";
        lockscreenContent.style.transition = "none";
        lockscreenBottom.style.transition = "none";
        lockscreenUnlockingContent.style.transition = "none";
    });

    lockscreen.addEventListener("touchmove", e => {
        if (!isDragging) return;
        currentY = e.touches[0].clientY - startY;

        if (phoneState === "locked") {
            if (currentY > 0) currentY = 0;
            let progress = Math.min(Math.abs(currentY) / threshold, 1);
            let blurValue = maxBlur * progress;

            setTranslateY(currentY);

            let unlockingContentY = window.innerHeight + currentY; 
            lockscreenUnlockingContent.style.transform = `translateY(${unlockingContentY}px)`;

            lockscreen.style.backdropFilter = `blur(${blurValue}px)`;
            if (hasPin) {
                lockscreen.style.backgroundColor = `rgba(0, 0, 0, ${0.2 * progress})`;
            }

            if (!hasPin) {
                lockscreenUnlockingContent.style.display = "none";        
            }
        } 
        else if (phoneState === "unlocking") {
            if (currentY < 0) currentY = 0;
            let progress = Math.min(currentY / threshold, 1);
            let blurValue = maxBlur * (1 - progress);

            setTranslateY(-window.innerHeight + currentY);

            let unlockingContentY = currentY;
            lockscreenUnlockingContent.style.transform = `translateY(${unlockingContentY}px)`;

            lockscreen.style.backdropFilter = `blur(${blurValue}px)`;
            lockscreen.style.backgroundColor = `rgba(0, 0, 0, ${0.2 * (1 - progress)})`;
        }
    });

    lockscreen.addEventListener("touchend", () => {
        if (!isDragging) return;
        isDragging = false;

        if (phoneState === "locked") {
            if (Math.abs(currentY) > threshold) {
                lockscreen.style.transition = "backdrop-filter 0.3s ease-out, transform 0.2s ease-out, opacity 0.2s ease-out";
                lockscreenContent.style.transition = "transform 0.2s ease-out";
                lockscreenBottom.style.transition = "transform 0.2s ease-out";
                lockscreenUnlockingContent.style.transition = "transform 0.2s ease-out";

                setTranslateY(-window.innerHeight);
                lockscreen.style.backdropFilter = `blur(${maxBlur}px)`;
        
                if (hasPin) {
                    lockscreenUnlockingContent.style.transform = `translateY(0px)`;
                } else {
                    lockscreen.style.transform = `translateY(-${window.innerHeight}px)`;
                }

                phoneState = "unlocking";

                if (!hasPin) {
                    lockscreen.style.opacity = "0";
                    homescreen.style.opacity = "1";

                    phoneState = "unlocked";
                    homescreen.style.pointerEvents = "all";
                    
                }
            } else {
                lockscreen.style.transition = "backdrop-filter 0.3s ease-out, transform 0.2s ease-out";
                lockscreenContent.style.transition = "transform 0.2s ease-out";
                lockscreenBottom.style.transition = "transform 0.2s ease-out";
                lockscreenUnlockingContent.style.transition = "transform 0.2s ease-out";

                setTranslateY(0);

                if (hasPin) {
                    lockscreenUnlockingContent.style.transform = `translateY(${window.innerHeight}px)`;
                } else {
                    lockscreen.style.transform = `translateY(0px)`;
                }

                lockscreen.style.backdropFilter = "blur(0px)";
            }
        } 
        else if (phoneState === "unlocking") {
            if (currentY > threshold) {
                lockscreen.style.transition = "backdrop-filter 0.3s ease-out, transform 0.2s ease-out";
                lockscreenContent.style.transition = "transform 0.2s ease-out";
                lockscreenBottom.style.transition = "transform 0.2s ease-out";
                lockscreenUnlockingContent.style.transition = "transform 0.2s ease-out";

                setTranslateY(0);
                lockscreen.style.backdropFilter = "blur(0px)";

                if (hasPin) {
                    lockscreenUnlockingContent.style.transform = `translateY(${window.innerHeight}px)`;
                } else {
                    lockscreen.style.transform = `translateY(0px)`;
                }

                phoneState = "locked";
            } else {
                lockscreen.style.transition = "backdrop-filter 0.3s ease-out, transform 0.2s ease-out";
                lockscreenContent.style.transition = "transform 0.2s ease-out";
                lockscreenBottom.style.transition = "transform 0.2s ease-out";
                lockscreenUnlockingContent.style.transition = "transform 0.2s ease-out";

                setTranslateY(-window.innerHeight);
                
                lockscreen.style.backdropFilter = `blur(${maxBlur}px)`;

                if (hasPin) {
                    lockscreenUnlockingContent.style.transform = `translateY(0px)`;
                } else {
                    lockscreen.style.transform = `translateY(-${window.innerHeight}px)`;
                }
            }
        }

        setTimeout(() => {
            lockscreen.style.transition = "";
            lockscreenContent.style.transition = "";
            lockscreenBottom.style.transition = "";
            lockscreenUnlockingContent.style.transition = "";
        }, 300);
    });

    function unlock() {
        lockscreen.style.transition = "backdrop-filter 0.3s ease-out, transform 0.2s ease-out, opacity 0.2s ease-out";

        lockscreen.style.transform = `translateY(-${window.innerHeight}px)`;
        lockscreen.style.backdropFilter = `blur(${maxBlur}px)`;

        lockscreen.style.opacity = "0";

        homescreen.style.opacity = "1";
        homescreen.style.pointerEvents = "all";

        phoneState = "unlocked";

        setTimeout(() => {
            lockscreen.style.transition = "";
        }, 300);
    }

    const pinButtons = [
        'pin-column-1', 'pin-column-2', 'pin-column-3',
        'pin-column-4', 'pin-column-5', 'pin-column-6',
        'pin-column-7', 'pin-column-8', 'pin-column-9',
        'pin-column-0'
    ];

    pinButtons.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () => {
            const digit = id === 'pin-column-0' ? 0 : parseInt(id.split('-').pop());
            pinClicked(digit);
            });
        }
    });

    const backspaceBtn = document.getElementById('pin-column-backspace');
        if (backspaceBtn) {
        backspaceBtn.addEventListener('click', () => {
            removeLastPinDigit();
        });
    }

    
    async function pinClicked(digit) {
        if (entered_pin.length < 4) {
            entered_pin.push(digit);
            updatePinCells();

            if (entered_pin.length === 4) {
                const pinStr = entered_pin.join('');

                const isValid = await verifyPin(window.currentUserId, pinStr);
                if (isValid) {
                    unlock();
                } else {
                    entered_pin = [];
                    updatePinCells();
                }
            }
        }
    }

});


function removeLastPinDigit() {
    if (entered_pin.length > 0) {
        entered_pin.pop();
        updatePinCells();
    }
}

function updatePinCells() {
    for (let i = 1; i <= 4; i++) {
        const cell = document.getElementById(`pin-cell-${i}`);
        if (entered_pin[i - 1] !== undefined) {
            cell.classList.add("filled");
        } else {
            cell.classList.remove("filled");
        }
    }
}


async function hashPin(pin) {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPin(userId, enteredPin) {
  const deviceIdStr = localStorage.getItem("device_id");
  if (!deviceIdStr) {
    return false;
  }
  const deviceId = Number(deviceIdStr);
  if (isNaN(deviceId)) {
    return false;
  }
  const userRef = db.collection("users").doc(userId);
  const docSnap = await userRef.get();
  if (!docSnap.exists) {
    return false;
  }

  const userData = docSnap.data();
  const devices = userData.devices || [];

  const device = devices.find(d => d.device_id === deviceId);
  if (!device) {
    return false;
  }

  const hashedPin = await hashPin(enteredPin);
  return hashedPin === device.pin_hash;
}
async function waitForUserId(timeout = 5000, interval = 100) {
  const start = Date.now();
  while (!window.currentUserId) {
    if (Date.now() - start > timeout) return null;
    await new Promise(r => setTimeout(r, interval));
  }
  return window.currentUserId;
}

async function checkPinStatus() {
  const userId = await waitForUserId();
  if (!userId) return false;

  const deviceIdStr = localStorage.getItem("device_id");
  if (!deviceIdStr) return false;
  const deviceId = Number(deviceIdStr);
  if (isNaN(deviceId)) return false;

  const userRef = db.collection("users").doc(userId);
  const docSnap = await userRef.get();
  if (!docSnap.exists) return false;

  const userData = docSnap.data();
  const devices = userData.devices || [];

  const device = devices.find(d => d.device_id === deviceId);
  if (!device) return false;

  const pinHash = device.pin_hash ?? null;
  if (!pinHash || typeof pinHash !== "string" || !/^[0-9a-f]{64}$/i.test(pinHash)) {
    return false;
  }

  return true;
}
