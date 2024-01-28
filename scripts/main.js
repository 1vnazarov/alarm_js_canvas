class Alarm {
    constructor(alarmsListElementId, addAlarmButtonId, alarmSoundUrl) {
        this.alarms = [];
        this.alarmsListElement = document.getElementById(alarmsListElementId);
        this.alarmSound = new Audio(alarmSoundUrl);
        this.alarmSound.addEventListener('ended', function () {
            this.currentTime = 0;
            this.play();
        }, false);
        document.getElementById(addAlarmButtonId).addEventListener('click', () => {
            const hours = document.getElementById('alarm-hours').value;
            const minutes = document.getElementById('alarm-minutes').value;
            if (hours !== '' && minutes !== '') {
                this.setAlarm({ hours: parseInt(hours), minutes: parseInt(minutes) });
                this.updateAlarmsList();
            }
        });
    }

    setAlarm(time) {
        if (this.isValidTime(time)) {
            this.alarms.push(time);
            this.alarms.sort((a, b) => a.hours * 60 + a.minutes - (b.hours * 60 + b.minutes));
        }
        else {
            console.error("Invalid time provided for alarm.");
        }
    }

    cancelAlarm(index) {
        this.alarms.splice(index, 1);
        this.updateAlarmsList();
    }

    updateAlarmsList() {
        this.alarmsListElement.innerHTML = '';
        for (let i = 0; i < this.alarms.length; i++) {
            const alarm = this.alarms[i];
            const listItem = document.createElement('li');
            listItem.innerText = this.formatTime(alarm.hours, alarm.minutes).join(':');

            const alarmTime = this.alarms[i].hours * 60 * 60 + this.alarms[i].minutes * 60;
            const now = new Date();
            const currentTime = now.getHours() * 60 * 60 + now.getMinutes() * 60 + now.getSeconds();
            const timeLeft = alarmTime - currentTime;
            if (timeLeft > 0) {
                const [hours, minutes] = this.formatTime(Math.floor(timeLeft / 3600), Math.floor((timeLeft % 3600) / 60));
                listItem.innerText += ` ${hours}:${minutes}`;
            }

            const deleteButton = document.createElement('button');
            deleteButton.innerText = alarm.isRinging ? 'Отменить' : 'Удалить';
            deleteButton.addEventListener('click', () => {
                if (alarm.isRinging) {
                    this.alarmSound.pause();
                    this.alarmSound.currentTime = 0;
                }
                this.cancelAlarm(i);
            });
            listItem.appendChild(deleteButton);
            this.alarmsListElement.appendChild(listItem);
        }
    }

    checkAlarms() {
        const now = new Date();
        const currentTime = now.getHours() * 60 * 60 + now.getMinutes() * 60 + now.getSeconds();
        for (let i = 0; i < this.alarms.length; i++) {
            const alarmTime = this.alarms[i].hours * 60 * 60 + this.alarms[i].minutes * 60;
            if (currentTime >= alarmTime) {
                this.alarmSound.play();
                this.alarms[i].isRinging = true;
                this.updateAlarmsList();
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
        return closestAlarm;
    }

    isValidTime(time) {
        if (time.hours < 0 || time.hours > 23 || time.minutes < 0 || time.minutes > 59) {
            return false;
        }
        return true;
    }

    formatTime = (hours, minutes) => {
        return [hours, minutes].map(unit => unit < 10 ? '0' + unit : unit);
    }
}

class Clock {
    constructor(canvasId, digitalClockId, formatSwitchId, alarmsListElementId, addAlarmButtonId, alarmSoundUrl) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");
        this.radius = this.canvas.height / 2;
        this.ctx.translate(this.radius, this.radius);
        this.radius *= 0.9;
        this.format24Hour = false;
        this.digitalClockElement = document.getElementById(digitalClockId);
        this.alarm = new Alarm(alarmsListElementId, addAlarmButtonId, alarmSoundUrl);
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
        this.alarm.checkAlarms();
        this.alarm.updateAlarmsList();
    }
}

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

const clock = new Clock("canvas", "digital-clock", "format-switch", "alarms-list", "add-alarm", "alarm.mp3");