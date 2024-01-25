class ClockHand {
    constructor(ctx, pos, length, width) {
        this.ctx = ctx;
        this.pos = pos;
        this.length = length;
        this.width = width;
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.lineWidth = this.width;
        this.ctx.lineCap = "round";
        this.ctx.moveTo(0, 0);
        this.ctx.rotate(this.pos);
        this.ctx.lineTo(0, -this.length);
        this.ctx.stroke();
        this.ctx.rotate(-this.pos);
    }
}

class ClockFace {
    constructor(ctx, radius) {
        this.ctx = ctx;
        this.radius = radius;
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = 'white';
        this.ctx.fill();

        const gradient = this.ctx.createRadialGradient(0, 0, this.radius * 0.95, 0, 0, this.radius * 1.05);
        gradient.addColorStop(0, '#333');
        gradient.addColorStop(0.5, 'white');
        gradient.addColorStop(1, '#333');
        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = this.radius * 0.1;
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.radius * 0.1, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#333';
        this.ctx.fill();
    }
}

class Clock {
    constructor(canvasId, digitalClockId, formatSwitchId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");
        this.radius = this.canvas.height / 2;
        this.ctx.translate(this.radius, this.radius);
        this.radius *= 0.9;
        this.format24Hour = false;
        this.alarms = [];
        this.digitalClockElement = document.getElementById(digitalClockId);
        document.getElementById(formatSwitchId).addEventListener('change', (event) => {
            this.format24Hour = event.target.checked;
            this.drawDigitalClock();
        });

        setInterval(() => this.drawClocks(), 1000);
        window.onload = () => this.drawClocks();
    }

    drawClock() {
        const clockFace = new ClockFace(this.ctx, this.radius);
        clockFace.draw();
        this.drawNumbers();
        this.drawTime();
        this.drawSecondMarks();
    }

    drawNumbers() {
        let ang;
        this.ctx.font = this.radius * 0.15 + "px arial";
        this.ctx.textBaseline = "middle";
        this.ctx.textAlign = "center";
        for (let num = 1; num < 13; num++) {
            ang = num * Math.PI / 6;
            this.ctx.rotate(ang);
            this.ctx.translate(0, -this.radius * 0.85);
            this.ctx.rotate(-ang);
            this.ctx.fillText(num.toString(), 0, 0);
            this.ctx.rotate(ang);
            this.ctx.translate(0, this.radius * 0.85);
            this.ctx.rotate(-ang);
        }
    }

    drawTime() {
        const now = new Date();
        let hour = now.getHours();
        let minute = now.getMinutes();
        let second = now.getSeconds();
        hour %= 12;
        hour = (hour * Math.PI / 6) + (minute * Math.PI / (6 * 60)) + (second * Math.PI / (360 * 60));
        const hourHand = new ClockHand(this.ctx, hour, this.radius * 0.5, this.radius * 0.07);
        hourHand.draw();
        minute = (minute * Math.PI / 30) + (second * Math.PI / (30 * 60));
        const minuteHand = new ClockHand(this.ctx, minute, this.radius * 0.8, this.radius * 0.07);
        minuteHand.draw();
        second = (second * Math.PI / 30);
        const secondHand = new ClockHand(this.ctx, second, this.radius * 0.9, this.radius * 0.02);
        secondHand.draw();
    }

    drawSecondMarks() {
        let ang;
        this.ctx.lineWidth = this.radius * 0.03;
        for (let sec = 0; sec < 60; sec++) {
            ang = sec * Math.PI / 30;
            this.ctx.beginPath();
            this.ctx.rotate(ang);
            this.ctx.moveTo(0, -this.radius * 0.95);
            this.ctx.lineTo(0, -this.radius);
            this.ctx.stroke();
            this.ctx.rotate(-ang);
        }
    }

    drawDigitalClock() {
        const now = new Date();
        let { hours, minutes, seconds } = {
            hours: now.getHours(),
            minutes: now.getMinutes(),
            seconds: now.getSeconds()
        };
        let ampm = 'AM';

        if (!this.format24Hour) {
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
        this.digitalClockElement.innerText = this.format24Hour ? `${hours}:${minutes}:${seconds}` : `${hours}:${minutes}:${seconds} ${ampm}`;
    }

    drawClocks() {
        this.drawClock();
        this.drawDigitalClock();
        this.checkAlarms();
    }

    setAlarm(time) {
        this.alarms.push(time);
    }

    cancelAlarm(time) {
        const index = this.alarms.indexOf(time);
        if (index > -1) {
            this.alarms.splice(index, 1);
        }
    }

    checkAlarms() {
        const now = new Date();
        const currentTime = now.getHours() * 60 * 60 + now.getMinutes() * 60 + now.getSeconds();
        for (let i = 0; i < this.alarms.length; i++) {
            const alarmTime = this.alarms[i].hours * 60 * 60 + this.alarms[i].minutes * 60;
            if (currentTime >= alarmTime) {
                alert('Alarm!');
                this.alarms.splice(i, 1);
                i--;
            }
        }
    }

    nextAlarm() {
        const now = new Date();
        const currentTime = now.getHours() * 60 * 60 + now.getMinutes() * 60 + now.getSeconds();
        let closestAlarm = null;
        let closestTime = 24 * 60 * 60;
        for (let i = 0; i < this.alarms.length; i++) {
            const alarmTime = this.alarms[i].hours * 60 * 60 + this.alarms[i].minutes * 60;
            if (alarmTime > currentTime && alarmTime - currentTime < closestTime) {
                closestAlarm = this.alarms[i];
                closestTime = alarmTime - currentTime;
            }
        }
        if (closestAlarm !== null) {
            console.log(`Next alarm at ${closestAlarm.hours}:${closestAlarm.minutes}. Time left: ${Math.floor(closestTime / 3600)}:${Math.floor((closestTime % 3600) / 60)}:${closestTime % 60}`);
        }
        else {
            console.log('No alarms set.');
        }
    }
}

let clock = new Clock("canvas", "digital-clock", "format-switch");
clock.nextAlarm();