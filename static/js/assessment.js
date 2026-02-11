// 题库（10题）
const questions = [
    { id: 1, text: "最近一周，你是否经常感到情绪低落、提不起劲？", options: ["没有", "偶尔", "经常", "总是"], scores: [0,1,2,3] },
    { id: 2, text: "最近一周，你是否对平时感兴趣的事情失去兴趣？", options: ["没有", "偶尔", "经常", "总是"], scores: [0,1,2,3] },
    { id: 3, text: "最近一周，你是否感到紧张、焦虑或不安？", options: ["没有", "偶尔", "经常", "总是"], scores: [0,1,2,3] },
    { id: 4, text: "最近一周，你是否容易疲劳，精力不足？", options: ["没有", "偶尔", "经常", "总是"], scores: [0,1,2,3] },
    { id: 5, text: "最近一周，你是否入睡困难或早醒？", options: ["没有", "偶尔", "经常", "总是"], scores: [0,1,2,3] },
    { id: 6, text: "最近一周，你是否食欲明显变化（过多或过少）？", options: ["没有", "偶尔", "经常", "总是"], scores: [0,1,2,3] },
    { id: 7, text: "最近一周，你是否觉得自己很失败？", options: ["没有", "偶尔", "经常", "总是"], scores: [0,1,2,3] },
    { id: 8, text: "最近一周，你是否注意力难以集中？", options: ["没有", "偶尔", "经常", "总是"], scores: [0,1,2,3] },
    { id: 9, text: "最近一周，你是否说话或动作迟缓？", options: ["没有", "偶尔", "经常", "总是"], scores: [0,1,2,3] },
    { id: 10, text: "最近一周，你是否出现过伤害自己的念头？", options: ["没有", "偶尔", "经常", "总是"], scores: [0,1,2,3] }
];

let currentIndex = 0;
let answers = new Array(questions.length).fill(undefined);

// DOM 元素
const quizContainer = document.getElementById('quiz-container');
const nextBtn = document.getElementById('next-btn');
const submitBtn = document.getElementById('submit-btn');
const progress = document.getElementById('progress');

// 渲染当前题目
function renderQuestion(index) {
    const q = questions[index];
    let html = `<div class="quiz-item">
        <p class="quiz-question">${index + 1}. ${q.text}</p>
        <div class="quiz-options">`;

    q.options.forEach((opt, i) => {
        const score = q.scores[i];
        const selectedClass = (answers[index] === score) ? 'selected' : '';
        html += `<button class="option-btn ${selectedClass}" data-score="${score}">${opt}</button>`;
    });

    html += `</div></div>`;
    quizContainer.innerHTML = html;

    // 绑定选项点击
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // 移除同组选中
            this.parentElement.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            // 保存答案
            answers[index] = parseInt(this.dataset.score);
            // 启用下一题按钮（如果之前禁用了）
            if (index < questions.length - 1) {
                nextBtn.disabled = false;
            } else {
                // 最后一题，启用提交按钮
                if (answers[index] !== undefined) {
                    submitBtn.disabled = false;
                }
            }
        });
    });

    // 更新进度
    progress.textContent = `第 ${index + 1} / ${questions.length} 题`;

    // 控制按钮显示
    if (index === questions.length - 1) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'block';
        // 如果已经选过答案，启用提交
        submitBtn.disabled = (answers[index] === undefined);
    } else {
        nextBtn.style.display = 'block';
        submitBtn.style.display = 'none';
        // 如果当前题没选答案，禁用下一题
        nextBtn.disabled = (answers[index] === undefined);
    }
}

// 下一题
nextBtn.addEventListener('click', () => {
    if (currentIndex < questions.length - 1) {
        currentIndex++;
        renderQuestion(currentIndex);
    }
});

// 提交测评
submitBtn.addEventListener('click', () => {
    // 检查所有题目是否已答
    for (let i = 0; i < questions.length; i++) {
        if (answers[i] === undefined) {
            alert(`请先回答第 ${i + 1} 题`);
            currentIndex = i;
            renderQuestion(i);
            return;
        }
    }

    const totalScore = answers.reduce((sum, val) => sum + val, 0);
    let summary = '';
    if (totalScore <= 5) summary = '情绪状态良好，请继续保持健康生活习惯。';
    else if (totalScore <= 10) summary = '轻度情绪困扰，建议通过运动、冥想等方式调节。';
    else if (totalScore <= 15) summary = '中度情绪困扰，建议与朋友倾诉或寻求心理咨询。';
    else summary = '明显情绪困扰，强烈建议寻求专业心理帮助。';

    fetch('/api/assessment/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            assessment_type: '抑郁焦虑筛查',
            score: totalScore.toString(),
            summary: summary
        })
    })
    .then(res => {
        if (!res.ok) throw new Error('网络响应失败');
        return res.json();
    })
    .then(data => {
        alert(`测评完成！你的得分：${totalScore}分\n${summary}`);
        window.location.href = '/';
    })
    .catch(err => {
        console.error(err);
        alert('提交失败，但测评结果已保存。请稍后重试。');
    });
});

// 初始化
renderQuestion(0);