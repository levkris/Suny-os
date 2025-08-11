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

if (window.matchMedia("(pointer:coarse)").matches) {
    document.body.addEventListener('long-press', () => {
        if (window.navigator.share) {
            window.navigator.share({
                title: 'Gyro Background',
                url: window.location.href
            });
        } else if (window.navigator.standalone) {
            window.alert('Add to home screen by clicking the "share" icon and then selecting "Add to Home Screen"');
        }
    });
}

