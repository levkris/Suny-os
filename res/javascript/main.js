    const output = document.getElementById('output');

    function handleOrientation(event) {
      const alpha = event.alpha?.toFixed(2);
      const beta  = event.beta?.toFixed(2);
      const gamma = event.gamma?.toFixed(2);

      output.innerHTML = `
        <strong>Orientation</strong><br>
        Alpha (Z): ${alpha}°<br>
        Beta (X): ${beta}°<br>
        Gamma (Y): ${gamma}°
      `;
    }

    function handleMotion(event) {
      const r = event.rotationRate;
      if (!r) return;
      output.innerHTML += `
        <br><br><strong>Rotation Rate</strong><br>
        Alpha: ${r.alpha?.toFixed(2)} °/s<br>
        Beta: ${r.beta?.toFixed(2)} °/s<br>
        Gamma: ${r.gamma?.toFixed(2)} °/s
      `;
    }


    function startSensors() {
      if (typeof DeviceOrientationEvent?.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
          .then(state => {
            if (state === 'granted') {
              window.addEventListener('deviceorientation', handleOrientation);
              window.addEventListener('devicemotion', handleMotion);
            } else {
              alert('Permission denied for motion sensors.');
            }
          })
          .catch(console.error);
      } else {
        window.addEventListener('deviceorientation', handleOrientation);
        window.addEventListener('devicemotion', handleMotion);
      }
    }

    document.getElementById('startBtn').addEventListener('click', startSensors);