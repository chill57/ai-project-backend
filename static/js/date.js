(function () {
    // ---------- 1. 状态 ----------
    let currentDate = new Date();
    let currentYear = currentDate.getFullYear();
    let currentMonth = currentDate.getMonth();
    let isCollapsed = false;   // 是否折叠（只显示一行）

    // 打卡记录 { '2025-02-18': { mood: '开心', custom: '今天很棒' }, ... }
    let checkedMap = JSON.parse(localStorage.getItem('daily_checks')) || {};

    // 迁移旧数据：如果存储的是布尔值，转换为对象格式
    (function migrateOldData() {
        let needSave = false;
        Object.keys(checkedMap).forEach(key => {
            if (typeof checkedMap[key] === 'boolean') {
                checkedMap[key] = { mood: null, custom: '' };
                needSave = true;
            }
        });
        if (needSave) {
            saveChecks();
        }
    })();

    // 当前选中的日期（YYYY-MM-DD）
    let selectedDateKey = null;

    // 当前选中的情绪（用于表单）
    let selectedMood = null;

    // ---------- 2. 工具函数 ----------
    function formatDateKey(year, month, day) {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    // 获取今天的日期键
    function getTodayKey() {
        const today = new Date();
        return formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());
    }

    // 保存打卡记录
    function saveChecks() {
        localStorage.setItem('daily_checks', JSON.stringify(checkedMap));
    }

    // 打卡指定日期（如果尚未打卡）
    function checkDate(dateKey, mood = null, custom = '') {
        if (!checkedMap[dateKey]) {
            checkedMap[dateKey] = { mood, custom };
            saveChecks();
            renderCalendar();
            if (selectedDateKey === dateKey) {
                updateDetailPanel(dateKey);
            }
        }
    }

    // 获取目标行号（折叠时用）：优先使用今天所在行，否则使用选中日期所在行，否则返回第一行（0）
    function getTargetRowIndex(year, month) {
        const firstDay = new Date(year, month, 1).getDay(); // 0-6
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // 先看今天是否在本月
        const todayKey = getTodayKey();
        const [todayYear, todayMonth, todayDay] = todayKey.split('-').map(Number);
        if (todayYear === year && todayMonth === month + 1) {
            return Math.floor((firstDay + todayDay - 1) / 7);
        }

        // 再看选中的日期是否在本月
        if (selectedDateKey) {
            const [selYear, selMonth, selDay] = selectedDateKey.split('-').map(Number);
            if (selYear === year && selMonth === month + 1) {
                return Math.floor((firstDay + selDay - 1) / 7);
            }
        }

        // 默认返回第一行
        return 0;
    }

    // ---------- 3. 情绪按钮点击事件绑定 ----------
    function bindMoodButtons() {
        const moodButtons = document.querySelectorAll('.mood-btn');
        moodButtons.forEach(btn => {
            btn.addEventListener('click', function () {
                // 移除所有按钮的选中类
                moodButtons.forEach(b => b.classList.remove('selected'));
                // 给当前按钮添加选中类
                this.classList.add('selected');
                // 记录选中的情绪（按钮文本）
                selectedMood = this.innerText.trim();
            });
        });
    }

    // ---------- 4. 更新详情面板 ----------
    function updateDetailPanel(dateKey) {
        const selectedDateEl = document.getElementById('selectedDate');
        const selectedContentEl = document.getElementById('selectedContent');
        const moodSelector = document.getElementById('moodSelector');
        const submitBtn = document.getElementById('submitCheckBtn');
        const customInput = document.getElementById('customInput');
        const todayKey = getTodayKey();

        if (!dateKey) {
            selectedDateEl.textContent = '请点击日期';
            selectedContentEl.innerHTML = '👆 点击上面某一天查看详情';
            if (moodSelector) moodSelector.style.display = 'none';
            if (submitBtn) submitBtn.style.display = 'none';
            return;
        }

        const [year, month, day] = dateKey.split('-');
        selectedDateEl.textContent = `${year}年${month}月${Number(day)}日`;

        const isChecked = !!checkedMap[dateKey];
        const isToday = (dateKey === todayKey);

        if (isChecked) {
            // 已打卡：显示情绪和自定义内容
            const record = checkedMap[dateKey];
            let contentHtml = '';
            if (record.mood) {
                contentHtml += `<p><strong>心情：</strong> ${record.mood}</p>`;
            }
            if (record.custom) {
                contentHtml += `<p><strong>记录：</strong> ${record.custom.replace(/\n/g, '<br>')}</p>`;
            }
            if (!record.mood && !record.custom) {
                contentHtml = '<p>已打卡，无额外记录</p>';
            }
            selectedContentEl.innerHTML = contentHtml;
            // 隐藏表单
            if (moodSelector) moodSelector.style.display = 'none';
            if (submitBtn) submitBtn.style.display = 'none';
        } else {
            // 未打卡：显示提示
            selectedContentEl.innerHTML = '❌ 尚未打卡，暂无内容';

            // 仅当今天是选中日期时才显示打卡表单
            if (isToday) {
                if (moodSelector) {
                    moodSelector.style.display = 'block';
                    // 清空情绪选中
                    document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected'));
                    selectedMood = null;
                }
                if (customInput) customInput.value = '';
                if (submitBtn) submitBtn.style.display = 'block';
            } else {
                if (moodSelector) moodSelector.style.display = 'none';
                if (submitBtn) submitBtn.style.display = 'none';
            }
        }
    }

    // ---------- 5. 渲染日历 ----------
    function renderCalendar() {
        const year = currentYear;
        const month = currentMonth;

        document.getElementById('currentMonthYear').innerText = `${year}年${month + 1}月`;
        const toggleBtn = document.getElementById('toggleCollapseBtn');
        if (toggleBtn) {
            toggleBtn.innerText = isCollapsed ? '⬇️ 展开' : '⬆️ 收起';
        }

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const todayKey = getTodayKey();

        const calendarEl = document.getElementById('calendar');
        calendarEl.innerHTML = '';

        // 根据折叠状态计算要渲染的行范围
        let startRow = 0;
        let endRow = 5;
        if (isCollapsed) {
            const targetRow = getTargetRowIndex(year, month);
            startRow = targetRow;
            endRow = targetRow;
        }

        for (let row = startRow; row <= endRow; row++) {
            let startDate = 1 + row * 7 - firstDay;

            for (let col = 0; col < 7; col++) {
                const currentDateNum = startDate + col;
                const isCurrentMonth = (currentDateNum >= 1 && currentDateNum <= daysInMonth);
                let dateKey = '';
                if (isCurrentMonth) {
                    dateKey = formatDateKey(year, month, currentDateNum);
                }

                const isChecked = isCurrentMonth ? !!checkedMap[dateKey] : false;
                const isToday = isCurrentMonth ? (dateKey === todayKey) : false;
                const isSelected = isCurrentMonth ? (dateKey === selectedDateKey) : false;

                // 预览文字：已打卡则根据记录生成，未打卡显示锁
                let preview = '';
                if (isCurrentMonth && isChecked) {
                    const record = checkedMap[dateKey];
                    if (record.mood) {
                        preview = record.mood;
                        if (record.custom) preview += '…';
                    } else if (record.custom) {
                        preview = record.custom.length > 5 ? record.custom.substring(0, 5) + '…' : record.custom;
                    } else {
                        preview = '✅';
                    }
                } else if (isCurrentMonth) {
                    preview = '🔒';
                } else {
                    preview = '';
                }

                const cell = document.createElement('div');
                cell.className = `day-cell ${isCurrentMonth ? '' : 'empty'} ${isChecked ? 'checked' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`;
                if (isCurrentMonth) {
                    cell.setAttribute('data-date', dateKey);
                }

                const daySpan = document.createElement('div');
                daySpan.className = 'day-number';
                if (isCurrentMonth) {
                    daySpan.innerText = currentDateNum;
                    daySpan.style.opacity = '';
                } else {
                    if (isCollapsed) {
                        daySpan.innerText = '';
                        daySpan.style.opacity = '0';
                    } else {
                        daySpan.innerText = (currentDateNum < 1 ? 30 + currentDateNum : currentDateNum - daysInMonth);
                        daySpan.style.opacity = '0.3';
                    }
                }

                const previewSpan = document.createElement('div');
                previewSpan.className = 'day-content-preview';
                previewSpan.innerText = preview;

                cell.appendChild(daySpan);
                cell.appendChild(previewSpan);

                if (isCurrentMonth) {
                    cell.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const key = cell.getAttribute('data-date');
                        selectedDateKey = key;
                        renderCalendar();
                        updateDetailPanel(key);
                    });
                }

                calendarEl.appendChild(cell);
            }
        }

        if (selectedDateKey) {
            const [selYear, selMonth] = selectedDateKey.split('-');
            if (parseInt(selYear) === year && parseInt(selMonth) === month + 1) {
                // 还在本月
            } else {
                selectedDateKey = null;
                updateDetailPanel(null);
            }
        } else {
            updateDetailPanel(null);
        }
    }

    // ---------- 6. 事件绑定 ----------
    // 月份切换
    document.getElementById('prevMonth').addEventListener('click', () => {
        if (currentMonth === 0) {
            currentMonth = 11;
            currentYear -= 1;
        } else {
            currentMonth -= 1;
        }
        currentDate = new Date(currentYear, currentMonth);
        currentYear = currentDate.getFullYear();
        currentMonth = currentDate.getMonth();
        isCollapsed = false;
        renderCalendar();
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        if (currentMonth === 11) {
            currentMonth = 0;
            currentYear += 1;
        } else {
            currentMonth += 1;
        }
        currentDate = new Date(currentYear, currentMonth);
        currentYear = currentDate.getFullYear();
        currentMonth = currentDate.getMonth();
        isCollapsed = false;
        renderCalendar();
    });

    // 提交打卡按钮
    document.getElementById('submitCheckBtn').addEventListener('click', () => {
        const todayKey = getTodayKey();
        // 获取选中的情绪（已存储在 selectedMood 中）
        const mood = selectedMood;
        const custom = document.getElementById('customInput').value.trim();

        if (!checkedMap[todayKey]) {
            checkDate(todayKey, mood, custom);
            selectedDateKey = todayKey;
            renderCalendar();
            updateDetailPanel(todayKey);
        }
    });

    // 重置所有打卡
    document.getElementById('resetData').addEventListener('click', () => {
        if (confirm('确定清除所有打卡记录吗？')) {
            checkedMap = {};
            localStorage.removeItem('daily_checks');
            renderCalendar();
            updateDetailPanel(null);
        }
    });

    // 折叠/展开按钮
    document.getElementById('toggleCollapseBtn').addEventListener('click', () => {
        isCollapsed = !isCollapsed;
        renderCalendar();
    });

    // 初始化情绪按钮事件
    bindMoodButtons();

    // 初始化：默认选中今天
    const todayKey = getTodayKey();
    selectedDateKey = todayKey;
    renderCalendar();
    updateDetailPanel(todayKey);
})();