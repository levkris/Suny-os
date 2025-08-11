if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    document.body.addEventListener('click', () => {
        DeviceOrientationEvent.requestPermission().then(response => {
            if (response === 'granted') startGyro();
        });
    });
} else {
    startGyro();
}

function startGyro() {
    window.addEventListener('deviceorientation', (event) => {
        const { beta, gamma } = event;

        const x = 50 + (gamma / 45) * 10;
        const y = 50 + (beta / 45) * 10;

        document.body.style.backgroundPosition = `${x}% ${y}%`;
    });
}