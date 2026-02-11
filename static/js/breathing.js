class BreathingGuide {
  constructor() {
      // DOM 元素
      this.breathBall = document.getElementById('breathBall');
      this.breathText = document.getElementById('breathText');
      this.timerDisplay = document.getElementById('timerDisplay');
      this.guideText = document.getElementById('guideText');
      this.startBtn = document.getElementById('startBtn');
      this.pauseBtn = document.getElementById('pauseBtn');
      this.resetBtn = document.getElementById('resetBtn');
      this.voiceToggle = document.getElementById('voiceToggle');
      this.rateSlider = document.getElementById('rateSlider');
      this.rateValue = document.getElementById('rateValue');
      this.phaseItems = document.querySelectorAll('.phase-item');

      // 呼吸阶段配置
      this.phases = [
          { name: 'inhale', text: '吸气', duration: 4, guide: '慢慢吸气... 感受空气充满肺部', scale: 1.8 },
          { name: 'hold', text: '屏息', duration: 4, guide: '保持住... 让氧气融入血液', scale: 1.8 },
          { name: 'exhale', text: '呼气', duration: 6, guide: '缓缓呼气... 释放所有紧张', scale: 1.0 },
          { name: 'rest', text: '休息', duration: 2, guide: '放松... 准备下一次呼吸', scale: 1.0 }
      ];

      // 状态
      this.currentPhaseIndex = 0;
      this.timeLeft = 0;
      this.timer = null;
      this.isRunning = false;
      this.cycleCount = 0;

      // 语音
      this.speech = window.speechSynthesis;
      this.isSpeechSupported = 'speechSynthesis' in window;
      this.utterance = null;
      this.voiceEnabled = true;

      this.init();
  }

  init() {
      // 语音速率显示
      this.rateSlider.addEventListener('input', () => {
          this.rateValue.textContent = this.rateSlider.value;
      });

      // 按钮事件
      this.startBtn.addEventListener('click', () => this.start());
      this.pauseBtn.addEventListener('click', () => this.pause());
      this.resetBtn.addEventListener('click', () => this.reset());
      this.voiceToggle.addEventListener('change', (e) => {
          this.voiceEnabled = e.target.checked;
      });

      // 初始状态
      this.reset();
  }

  start() {
      if (this.isRunning) return;
      this.isRunning = true;
      this.startBtn.disabled = true;
      this.pauseBtn.disabled = false;

      // 如果之前是暂停状态，直接继续
      if (this.timer) {
          this.resumeTimer();
          return;
      }

      // 从头开始
      this.currentPhaseIndex = 0;
      this.cycleCount = 0;
      this.enterPhase(this.currentPhaseIndex);
  }

  enterPhase(index) {
      const phase = this.phases[index];
      this.currentPhaseIndex = index;
      this.timeLeft = phase.duration;

      // 更新UI
      this.breathText.textContent = phase.text;
      this.timerDisplay.textContent = this.timeLeft;
      this.guideText.textContent = phase.guide;
      this.breathBall.style.transition = `transform ${phase.duration}s linear`;
      this.breathBall.style.transform = `scale(${phase.scale})`;

      // 更新阶段指示器
      this.phaseItems.forEach((item, i) => {
          item.classList.toggle('active', i === index);
      });

      // 语音引导
      this.speak(phase.guide);

      // 启动倒计时
      this.timer = setInterval(() => this.tick(), 1000);
  }

  tick() {
      this.timeLeft--;
      this.timerDisplay.textContent = this.timeLeft > 0 ? this.timeLeft : '--';

      if (this.timeLeft <= 0) {
          clearInterval(this.timer);
          this.timer = null;

          // 进入下一阶段
          let nextIndex = this.currentPhaseIndex + 1;
          if (nextIndex >= this.phases.length) {
              nextIndex = 0;
              this.cycleCount++;
              this.recordSession(); // 每完成一个循环记录一次
          }
          this.enterPhase(nextIndex);
      }
  }

  pause() {
      if (!this.isRunning) return;
      this.isRunning = false;
      this.startBtn.disabled = false;
      this.pauseBtn.disabled = true;

      clearInterval(this.timer);
      this.timer = null;

      // 暂停语音
      if (this.speech && this.utterance) {
          this.speech.pause();
      }
  }

  resumeTimer() {
      if (this.timer) clearInterval(this.timer);
      this.timer = setInterval(() => this.tick(), 1000);
      if (this.speech) this.speech.resume();
  }

  reset() {
      this.pause();
      this.currentPhaseIndex = 0;
      this.timeLeft = 0;
      this.cycleCount = 0;

      this.breathBall.style.transform = 'scale(1)';
      this.breathBall.style.transition = 'none';
      this.breathText.textContent = '准备';
      this.timerDisplay.textContent = '--';
      this.guideText.textContent = '点击“开始引导”，跟随动画和语音进行呼吸练习。';

      this.phaseItems.forEach((item, i) => {
          item.classList.toggle('active', i === 0);
      });

      this.startBtn.disabled = false;
      this.pauseBtn.disabled = true;

      if (this.speech) this.speech.cancel();
  }

  speak(text) {
      if (!this.voiceEnabled || !this.isSpeechSupported) return;
      this.speech.cancel();
      this.utterance = new SpeechSynthesisUtterance(text);
      this.utterance.lang = 'zh-CN';
      this.utterance.rate = parseFloat(this.rateSlider.value);
      this.utterance.volume = 0.9;
      this.speech.speak(this.utterance);
  }

  recordSession() {
      fetch('/api/breathing/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              duration_seconds: 16, // 吸4+屏4+呼6+休2=16秒
              technique: '4-4-6呼吸法',
              calm_level_before: null,
              calm_level_after: null
          })
      }).catch(err => console.warn('记录失败，但不影响使用', err));
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  new BreathingGuide();
});