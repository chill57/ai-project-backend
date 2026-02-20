//// 页面加载完成后执行（增强鲁棒性）
//document.addEventListener('DOMContentLoaded', function () {
//    // 获取所有导览按钮和内容块
//    const navBtns = document.querySelectorAll('.nav-btn');
//    const contents = document.querySelectorAll('.content');

//    // 给每个导览按钮绑定点击事件
//    navBtns.forEach(btn => {
//        btn.addEventListener('click', () => {
//            // 1. 获取当前点击按钮对应的内容ID
//            const targetId = btn.getAttribute('data-id');

//            // 2. 移除所有按钮的active类（取消选中状态）
//            navBtns.forEach(b => b.classList.remove('active'));
//            // 3. 给当前点击按钮添加active类（选中状态）
//            btn.classList.add('active');

//            // 4. 隐藏所有内容块
//            contents.forEach(content => content.classList.remove('active'));
//            // 5. 显示对应ID的内容块
//            document.getElementById(targetId).classList.add('active');
//        });
//    });
//});



// 等待DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function () {
    // 核心函数：显示指定内容块，隐藏其他
    window.showContent = function (contentId) {
        // 1. 隐藏所有内容块
        const allBlocks = document.querySelectorAll('.content-block');
        allBlocks.forEach(block => block.classList.remove('active'));

        // 2. 显示目标内容块
        const targetBlock = document.getElementById(contentId);
        if (targetBlock) {
            targetBlock.classList.add('active');
        }

        // 3. 同步更新导航按钮样式
        const allNavBtns = document.querySelectorAll('.nav-btn');
        allNavBtns.forEach(btn => btn.classList.remove('active'));
        if (event && event.target) {
            event.target.classList.add('active');
        }
    };

    // 页面加载时：根据URL锚点自动显示对应内容块
    function initByHash() {
        // 获取URL锚点，默认显示content1
        const hash = window.location.hash || '#content1';
        const contentId = hash.replace('#', ''); // 提取锚点名称

        // 显示对应内容块
        showContent(contentId);

        // 同步激活对应导航按钮
        const navBtns = document.querySelectorAll('.nav-btn');
        navBtns.forEach(btn => {
            if (btn.onclick && btn.onclick.toString().includes(contentId)) {
                btn.classList.add('active');
            }
        });
    }

    // 初始化
    initByHash();

    // 监听URL锚点变化（如手动修改URL）
    window.addEventListener('hashchange', initByHash);

    console.log("B页面加载完成，当前激活内容块：", window.location.hash.replace('#', 'content1'));
});