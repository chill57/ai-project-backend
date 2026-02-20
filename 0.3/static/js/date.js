(function () {
    // ---------- 1. 每天的内容配置（可随意修改） ----------
    const contentMap = {
        // 格式 'YYYY-MM-DD': '想显示的内容（支持HTML）'
        '2025-02-18': '今天开始试行打卡！',
        '2025-02-20': '坚持就是胜利 ✌️',
        '2025-02-22': '可以放图片或链接：<a href="#">示例链接</a>',
    };
    const DEFAULT_CONTENT = '✨ 今天的内容还没想好～';

    // ---------- 2. 状态 ----------
    let currentDate = new Date();
    let currentYear = currentDate.getFullYear();
    let currentMonth = currentDate.getMonth();
    let isCollapsed = false;   // 是否折叠（只显示一行）

    // 打卡记录 { '2025-02-18': true, ... }
    let checkedMap = JSON.parse(localStorage.getItem('daily_checks')) || {};

    // 当前选中的日期（YYYY-MM-DD）
    let selectedDateKey = null;

    // ---------- 3. 工具函数 ----------
    function formatDateKey(year, month, day) {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    // 获取今天的日期键
    function getTodayKey() {
        const today = new Date();
        return formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());
    }

    // 获取某天显示的内容
    function getContentForDate(dateKey) {
        return contentMap[dateKey] || DEFAULT_CONTENT;
    }

    // 保存打卡记录
    function saveChecks() {
        localStorage.setItem('daily_checks', JSON.stringify(checkedMap));
    }

    // 打卡指定日期（如果尚未打卡）
    function checkDate(dateKey) {
        if (!checkedMap[dateKey]) {
            checkedMap[dateKey] = true;
            saveChecks();
            renderCalendar();
            // 如果当前选中的就是被打卡的日期，更新详情面板
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
            // 今天在本月，计算行号
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

    // ---------- 4. 更新详情面板 ----------
    function updateDetailPanel(dateKey) {
        const selectedDateEl = document.getElementById('selectedDate');
        const selectedContentEl = document.getElementById('selectedContent');
        const checkBtn = document.getElementById('checkTodayBtn');

        if (!dateKey) {
            selectedDateEl.textContent = '请点击日期';
            selectedContentEl.innerHTML = '👆 点击上面某一天查看详情';
            checkBtn.style.display = 'none';
            return;
        }

        // 解析日期显示
        const [year, month, day] = dateKey.split('-');
        selectedDateEl.textContent = `${year}年${month}月${Number(day)}日`;

        const todayKey = getTodayKey();
        const isChecked = !!checkedMap[dateKey];

        // 显示内容：已打卡则显示内容，否则显示未打卡提示
        if (isChecked) {
            selectedContentEl.innerHTML = getContentForDate(dateKey);
        } else {
            selectedContentEl.innerHTML = '❌ 尚未打卡，暂无内容';
        }

        // 控制打卡按钮：只有今天且未打卡时才显示并可用
        if (dateKey === todayKey && !isChecked) {
            checkBtn.style.display = 'block';
            checkBtn.disabled = false;
            checkBtn.textContent = '今日打卡';
        } else if (dateKey === todayKey && isChecked) {
            // 今天已打卡，显示已打卡按钮（禁用）
            checkBtn.style.display = 'block';
            checkBtn.disabled = true;
            checkBtn.textContent = '✅ 今日已打卡';
        } else {
            checkBtn.style.display = 'none';
        }
    }

    // ---------- 5. 渲染日历 ----------
    function renderCalendar() {
        const year = currentYear;
        const month = currentMonth;

        document.getElementById('currentMonthYear').innerText = `${year}年${month + 1}月`;
        // 更新折叠按钮文字（如果按钮用 id="toggleCollapseBtn"）
        const toggleBtn = document.getElementById('toggleCollapseBtn');
        if (toggleBtn) {
            toggleBtn.innerText = isCollapsed ? '⬇️ 展开' : '⬆️ 收起';
        }

        const firstDay = new Date(year, month, 1).getDay(); // 当月第一天星期几 (0-6)
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const todayKey = getTodayKey();

        const calendarEl = document.getElementById('calendar');
        calendarEl.innerHTML = '';

        // --- 根据折叠状态计算要渲染的行范围 ---
        let startRow = 0;
        let endRow = 5; // 最多6行（一个月最多跨6周）
        if (isCollapsed) {
            const targetRow = getTargetRowIndex(year, month);
            startRow = targetRow;
            endRow = targetRow; // 只渲染一行
        }

        // 循环每一行
        for (let row = startRow; row <= endRow; row++) {
            // 计算该行第一个格子对应的日期（公式：该行周日的日期 = 1 + row*7 - firstDay）
            let startDate = 1 + row * 7 - firstDay;

            // 生成该行的7个格子
            for (let col = 0; col < 7; col++) {
                const currentDateNum = startDate + col; // 当前格子的日期数字（可能 <=0 或 > daysInMonth）

                // 判断是否属于当月
                const isCurrentMonth = (currentDateNum >= 1 && currentDateNum <= daysInMonth);
                let dateKey = '';
                if (isCurrentMonth) {
                    dateKey = formatDateKey(year, month, currentDateNum);
                }

                const isChecked = isCurrentMonth ? !!checkedMap[dateKey] : false;
                const isToday = isCurrentMonth ? (dateKey === todayKey) : false;
                const isSelected = isCurrentMonth ? (dateKey === selectedDateKey) : false;

                // 预览文字：只有已打卡且是当月才显示内容预览
                let preview = '';
                if (isCurrentMonth && isChecked) {
                    const content = getContentForDate(dateKey);
                    preview = content.length > 6 ? content.substring(0, 5) + '…' : content;
                } else if (isCurrentMonth) {
                    preview = '🔒'; // 未打卡显示锁（可改为 '' 完全隐藏）
                } else {
                    preview = ''; // 非当月格子不显示预览
                }

                const cell = document.createElement('div');
                cell.className = `day-cell ${isCurrentMonth ? '' : 'empty'} ${isChecked ? 'checked' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`;
                if (isCurrentMonth) {
                    cell.setAttribute('data-date', dateKey);
                }

                const daySpan = document.createElement('div');
                daySpan.className = 'day-number';
                // 显示日期数字（非当月也显示，但半透明）
                if (isCurrentMonth) {
                    daySpan.innerText = currentDateNum;
                    daySpan.style.opacity = ''; // 恢复默认不透明度
                } else {
                    // 非当月格子：在折叠模式下完全隐藏数字，在完整日历中显示浅色数字
                    if (isCollapsed) {
                        daySpan.innerText = '';      // 不显示数字
                        daySpan.style.opacity = '0'; // 完全透明（可选）
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
                        renderCalendar(); // 重新渲染以更新选中样式
                        updateDetailPanel(key);
                    });
                }

                calendarEl.appendChild(cell);
            }
        }

        // 如果选中的日期不在本月，清空选中
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

    // 今日打卡按钮
    document.getElementById('checkTodayBtn').addEventListener('click', () => {
        const todayKey = getTodayKey();
        if (!checkedMap[todayKey]) {
            checkDate(todayKey);
            // 打卡后自动选中今天（如果是今天的话）
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

    document.getElementById('toggleCollapseBtn').addEventListener('click', () => {
        isCollapsed = !isCollapsed;
        renderCalendar();
        // 折叠后，如果当前选中的日期不在可视行，可能不显示，但点击格子会重新选中
    });

    // 初始化：默认选中今天
    const todayKey = getTodayKey();
    selectedDateKey = todayKey;
    renderCalendar();
    updateDetailPanel(todayKey);
})();