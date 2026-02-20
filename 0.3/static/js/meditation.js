let selectedMinutes = null;
let timerInterval = null;
let secondsRemaining = 0;
let totalSeconds = 0;

const durationBtns = document.querySelectorAll('.duration-btn');
const startBtn = document.getElementById('start-meditation');
const meditationActive = document.getElementById('meditation-active');
const timerDisplay = document.getElementById('timerDisplay');
const stopBtn = document.getElementById('stop-meditation');
const durationOptions = document.getElementById('duration-options');

// 时长选择
durationBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        // 移除其他选中状态
        durationBtns.forEach(b => b.classList.remove('selected'));
        this.classList.add('selected');
        selectedMinutes = parseInt(this.dataset.minutes);
        startBtn.disabled = false;
    });
});

// 开始冥想
startBtn.addEventListener('click', function() {
    if (!selectedMinutes) {
        alert('请先选择冥想时长');
        return;
    }

    totalSeconds = selectedMinutes * 60;
    secondsRemaining = totalSeconds;

    // 隐藏选择区，显示计时区
    durationOptions.style.display = 'none';
    startBtn.style.display = 'none';
    meditationActive.style.display = 'block';

    updateTimerDisplay();
    timerInterval = setInterval(() => {
        secondsRemaining--;
        updateTimerDisplay();

        if (secondsRemaining <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            endMeditation();
        }
    }, 1000);
});

// 更新显示
function updateTimerDisplay() {
    const minutes = Math.floor(secondsRemaining / 60);
    const seconds = secondsRemaining % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// 结束冥想
function endMeditation() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    fetch('/api/meditation/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            duration_seconds: totalSeconds,
            theme: '正念冥想',
            feeling_after: '放松'
        })
    })
    .then(res => {
        if (!res.ok) throw new Error('网络响应失败');
        return res.json();
    })
    .then(data => {
        alert('🧘 冥想结束，感谢你的练习！');
        resetUI();
    })
    .catch(err => {
        console.error(err);
        alert('冥想记录保存失败，但你的练习已完成。');
        resetUI();
    });
}

// 重置界面
function resetUI() {
    selectedMinutes = null;
    durationBtns.forEach(b => b.classList.remove('selected'));
    durationOptions.style.display = 'flex';
    startBtn.style.display = 'block';
    startBtn.disabled = true;
    meditationActive.style.display = 'none';
}

// 手动结束
stopBtn.addEventListener('click', function() {
    endMeditation();
});

// 页面卸载清理定时器
window.addEventListener('beforeunload', function() {
    if (timerInterval) clearInterval(timerInterval);
});