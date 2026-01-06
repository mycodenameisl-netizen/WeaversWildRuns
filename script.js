const audio = document.getElementById("audio");
const canvas = document.getElementById("visualizer");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startButton");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const source = audioCtx.createMediaElementSource(audio);
const analyser = audioCtx.createAnalyser();

source.connect(analyser);
analyser.connect(audioCtx.destination);

analyser.fftSize = 256;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

// Detect iOS
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

if (isIOS) {
    startButton.classList.remove("hidden");
    audio.pause();
} else {
    audio.play().then(() => {
        audioCtx.resume();
        draw();
    });
}

startButton.addEventListener("click", () => {
    startButton.classList.add("hidden");
    audio.play();
    audioCtx.resume();
    draw();
});

function draw() {
    requestAnimationFrame(draw);

    analyser.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = 150;
    const bars = bufferLength;

    ctx.save();
    ctx.translate(cx, cy);

    // Slow rotation for PS1 vibe
    ctx.rotate(Date.now() * 0.0002);

    for (let i = 0; i < bars; i++) {
        const value = dataArray[i];
        const barHeight = value * 0.8;

        const angle = (i / bars) * Math.PI * 2;

        const x1 = Math.cos(angle) * radius;
        const y1 = Math.sin(angle) * radius;

        const x2 = Math.cos(angle) * (radius + barHeight);
        const y2 = Math.sin(angle) * (radius + barHeight);

        // Neon purple laser color
        ctx.strokeStyle = `rgba(180, 0, 255, ${0.4 + value / 255})`;
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    ctx.restore();
}
