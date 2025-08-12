function updateTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const time = `${hours}:${minutes}`;

    document.querySelectorAll(".time").forEach(element => {
        element.textContent = time;
    });
}

function updateDay() {
    const now = new Date();
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    document.querySelectorAll(".day").forEach(element => {
        element.textContent = days[now.getDay()];
    });
}

function updateDate() {
    const now = new Date();
    const date = now.getDate();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    document.querySelectorAll(".date").forEach(element => {
        element.textContent = `${date} ${monthNames[now.getMonth()]} ${now.getFullYear()}`;
    });
}

updateTime();
updateDay();
updateDate();

setInterval(updateTime, 1000);
setInterval(updateDay, 1000);
setInterval(updateDate, 1000);
