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
});

let entered_pin = [];

document.addEventListener("DOMContentLoaded", () => {
    let lockscreen = document.getElementById("lockscreen");
    let lockscreenContent = lockscreen.querySelector(".lockscreen-content");
    let lockscreenBottom = lockscreen.querySelector(".lockscreen-bottom");
    let lockscreenUnlockingContent = lockscreen.querySelector(".lockscreen-unlocking-content");

    let startY = 0;
    let currentY = 0;
    let isDragging = false;
    let phoneState = "locked";
    let threshold = 250;
    let maxBlur = parseFloat(getComputedStyle(document.documentElement)
                     .getPropertyValue("--blur")) || 6.86;

    function setTranslateY(value) {
        lockscreenContent.style.transform = `translateY(${value}px)`;
        lockscreenBottom.style.transform = `translateY(${value}px)`;
        lockscreenUnlockingContent.style.transform = `translateY(${value}px)`;
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
            lockscreen.style.backgroundColor = `rgba(0, 0, 0, ${0.2 * progress})`;
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
                lockscreen.style.transition = "backdrop-filter 0.3s ease-out";
                lockscreenContent.style.transition = "transform 0.2s ease-out";
                lockscreenBottom.style.transition = "transform 0.2s ease-out";
                lockscreenUnlockingContent.style.transition = "transform 0.2s ease-out";

                setTranslateY(-window.innerHeight);
                lockscreen.style.backdropFilter = `blur(${maxBlur}px)`;
        
                lockscreenUnlockingContent.style.transform = `translateY(0)`;

                phoneState = "unlocking";
            } else {
                lockscreen.style.transition = "backdrop-filter 0.3s ease-out";
                lockscreenContent.style.transition = "transform 0.2s ease-out";
                lockscreenBottom.style.transition = "transform 0.2s ease-out";
                lockscreenUnlockingContent.style.transition = "transform 0.2s ease-out";

                setTranslateY(0);

                lockscreenUnlockingContent.style.transform = `translateY(${window.innerHeight}px)`;

                lockscreen.style.backdropFilter = "blur(0px)";
            }
        } 
        else if (phoneState === "unlocking") {
            if (currentY > threshold) {
                lockscreen.style.transition = "backdrop-filter 0.3s ease-out";
                lockscreenContent.style.transition = "transform 0.2s ease-out";
                lockscreenBottom.style.transition = "transform 0.2s ease-out";
                lockscreenUnlockingContent.style.transition = "transform 0.2s ease-out";

                setTranslateY(0);
                lockscreen.style.backdropFilter = "blur(0px)";

                lockscreenUnlockingContent.style.transform = `translateY(${window.innerHeight}px)`;

                phoneState = "locked";
            } else {
                lockscreen.style.transition = "backdrop-filter 0.3s ease-out";
                lockscreenContent.style.transition = "transform 0.2s ease-out";
                lockscreenBottom.style.transition = "transform 0.2s ease-out";
                lockscreenUnlockingContent.style.transition = "transform 0.2s ease-out";

                setTranslateY(-window.innerHeight);
                lockscreen.style.backdropFilter = `blur(${maxBlur}px)`;

                lockscreenUnlockingContent.style.transform = `translateY(0px)`;
            }
        }

        setTimeout(() => {
            lockscreen.style.transition = "";
            lockscreenContent.style.transition = "";
            lockscreenBottom.style.transition = "";
            lockscreenUnlockingContent.style.transition = "";
        }, 300);
    });
});

function pinClicked(digit) {
    if (entered_pin.length < 4) {
        entered_pin.push(digit);
        updatePinCells();

        if (entered_pin.length === 4) {
            console.log("PIN entered:", entered_pin.join(''));
        }
    }
}

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

