// ---------- 获取元素 ----------
const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const closeLogin = document.getElementById('closeLogin');
const modalLoginBtn = document.getElementById('modalLoginBtn');
const modalRegisterBtn = document.getElementById('modalRegisterBtn');
const registerModal = document.getElementById('registerModal');
const closeRegister = document.getElementById('closeRegister');
const backToLogin = document.getElementById('backToLogin');
const registerConfirmBtn = document.getElementById('modalRegisterConfirmBtn');
const loginUsername = document.getElementById('loginUsername');
const loginPassword = document.getElementById('loginPassword');

// ---------- 原有功能：打开/关闭模态框 ----------
// 点击登录按钮打开登录模态框
loginBtn.onclick = function () {
    // 如果已经登录（按钮文字是用户名），则跳转页面
    if (localStorage.getItem('isLoggedIn') === 'true') {
        window.location.href = '/user.html'; // 已登录时点击跳转
    } else {
        loginModal.style.display = 'block';   // 未登录时打开弹窗
    }
};

// 关闭登录模态框（小叉）
closeLogin.onclick = function () {
    loginModal.style.display = 'none';
};

// 点击遮罩关闭登录模态框（同时处理注册模态框）
window.onclick = function (event) {
    if (event.target == loginModal) {
        loginModal.style.display = 'none';
    }
    if (event.target == registerModal) {
        registerModal.style.display = 'none';
    }
};

// 登录弹窗中的“注册”按钮：切换到注册弹窗
modalRegisterBtn.onclick = function () {
    loginModal.style.display = 'none';
    registerModal.style.display = 'block';
};

// 关闭注册模态框（小叉）
closeRegister.onclick = function () {
    registerModal.style.display = 'none';
};

// 返回登录链接
backToLogin.onclick = function () {
    registerModal.style.display = 'none';
    loginModal.style.display = 'block';
};

// ---------- 新增功能：模拟登录 ----------
modalLoginBtn.onclick = function () {
    const username = loginUsername.value.trim();
    const password = loginPassword.value.trim();

    if (!username || !password) {
        alert('请输入账号和密码');
        return;
    }

    // 模拟网络请求（禁用按钮）
    modalLoginBtn.disabled = true;
    modalLoginBtn.textContent = '登录中...';

    setTimeout(() => {
        // 模拟验证：用户名=上官，密码=1234
        if (username === '上官' && password === '1234') {
            alert('登录成功！');
            loginModal.style.display = 'none';   // 关闭登录弹窗
            // 更新页面按钮：改为用户名，并设置点击跳转
            loginBtn.textContent = username;
            loginBtn.title = '首页';
            loginBtn.onclick = function () {
                window.location.href = './home.html'; // 点击跳转
            };
            // 保存登录状态
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', username);
        } else {
            alert('用户名或密码错误');
        }

        // 恢复按钮状态
        modalLoginBtn.disabled = false;
        modalLoginBtn.textContent = '登录';
    }, 500);
};

// ---------- 页面加载时检查登录状态 ----------
if (localStorage.getItem('isLoggedIn') === 'true') {
    const savedUsername = localStorage.getItem('username');
    loginBtn.textContent = savedUsername;
    loginBtn.title = '首页';
    loginBtn.onclick = function () {
        window.location.href = './home.html';
    };
}