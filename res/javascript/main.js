setInterval(() => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');

    const time = `${hours}:${minutes}`;

    document.getElementById("time").textContent = time;
}, 1000);
