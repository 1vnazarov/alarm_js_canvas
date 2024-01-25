const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let radius = canvas.height / 2;
ctx.translate(radius, radius);
radius *= 0.9;

const drawClock = () => {
    drawFace();
    drawNumbers();
    drawTime();
    drawSecondMarks();
}

const drawFace = () => {
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();

    const gradient = ctx.createRadialGradient(0, 0, radius * 0.95, 0, 0, radius * 1.05);
    gradient.addColorStop(0, '#333');
    gradient.addColorStop(0.5, 'white');
    gradient.addColorStop(1, '#333');
    ctx.strokeStyle = gradient;
    ctx.lineWidth = radius * 0.1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.1, 0, 2 * Math.PI);
    ctx.fillStyle = '#333';
    ctx.fill();
}

const drawNumbers = () => {
    let ang;
    ctx.font = radius * 0.15 + "px arial";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    for (let num = 1; num < 13; num++) {
        ang = num * Math.PI / 6;
        ctx.rotate(ang);
        ctx.translate(0, -radius * 0.85);
        ctx.rotate(-ang);
        ctx.fillText(num.toString(), 0, 0);
        ctx.rotate(ang);
        ctx.translate(0, radius * 0.85);
        ctx.rotate(-ang);
    }
}

const drawTime = () => {
    const now = new Date();
    let hour = now.getHours();
    let minute = now.getMinutes();
    let second = now.getSeconds();
    hour %= 12;
    hour = (hour * Math.PI / 6) + (minute * Math.PI / (6 * 60)) + (second * Math.PI / (360 * 60));
    drawHand(hour, radius * 0.5, radius * 0.07);
    minute = (minute * Math.PI / 30) + (second * Math.PI / (30 * 60));
    drawHand(minute, radius * 0.8, radius * 0.07);
    second = (second * Math.PI / 30);
    drawHand(second, radius * 0.9, radius * 0.02);
}

const drawHand = (pos, length, width) => {
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.moveTo(0, 0);
    ctx.rotate(pos);
    ctx.lineTo(0, -length);
    ctx.stroke();
    ctx.rotate(-pos);
}

const drawSecondMarks = () => {
    let ang;
    ctx.lineWidth = radius * 0.03;
    for (let sec = 0; sec < 60; sec++) {
        ang = sec * Math.PI / 30;
        ctx.beginPath();
        ctx.rotate(ang);
        ctx.moveTo(0, -radius * 0.95);
        ctx.lineTo(0, -radius);
        ctx.stroke();
        ctx.rotate(-ang);
    }
}

let format24Hour = false;
document.getElementById('format-switch').addEventListener('change', (event) => {
    format24Hour = event.target.checked;
    drawDigitalClock();
});

const drawDigitalClock = () => {
    const now = new Date();
    let { hours, minutes, seconds } = {
        hours: now.getHours(),
        minutes: now.getMinutes(),
        seconds: now.getSeconds()
    };
    let ampm = 'AM';

    if (!format24Hour) {
        if (hours >= 12) {
            ampm = 'PM';
        }

        if (hours > 12) {
            hours -= 12;
        }

        if (hours === 0) {
            hours = 12;
        }
    }
    
    [hours, minutes, seconds] = [hours, minutes, seconds].map(unit => unit < 10 ? '0' + unit : unit);
    document.getElementById('digital-clock').innerText = format24Hour ? `${hours}:${minutes}:${seconds}` : `${hours}:${minutes}:${seconds} ${ampm}`;
}

const drawClocks = () => {
    drawClock();
    drawDigitalClock();
}

setInterval(drawClocks, 1000);
window.onload = drawClocks;