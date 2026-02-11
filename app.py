"""
心理健康应用后端 - 完整版
功能：提供用户认证（手机号）、AI对话、情绪调节、冥想、心理测评的数据接口
数据库：SQLite
"""

# ---------- 1. 导入所有必需的库 ----------
from flask import Flask, request, jsonify, session, render_template
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import os
from dotenv import load_dotenv
from datetime import datetime

# ---------- 2. 加载环境变量并初始化应用 ----------
load_dotenv()
app = Flask(__name__)

# 配置数据库（SQLite，文件名为 mental_health.db）
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///mental_health.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 设置密钥（用于session加密，务必在Replit的Secrets中设置 SECRET_KEY）
app.secret_key = os.environ.get('SECRET_KEY',
                                'dev-fallback-secret-for-test-only')

# 初始化数据库对象
db = SQLAlchemy(app)

# ---------- 3. 定义所有数据表模型（Python类） ----------


class User(db.Model):
    """用户表，用于手机号登录注册"""
    id = db.Column(db.Integer, primary_key=True)
    phone = db.Column(db.String(11), unique=True, nullable=False)  # 手机号，唯一
    password_hash = db.Column(db.String(200), nullable=False)  # 加密后的密码
    nickname = db.Column(db.String(50))  # 昵称（可选）
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # 注册时间
    # 关联关系（便于查询用户的所有记录）
    conversations = db.relationship('Conversation', backref='user', lazy=True)
    breathing_sessions = db.relationship('BreathingSession',
                                         backref='user',
                                         lazy=True)
    meditation_sessions = db.relationship('MeditationSession',
                                          backref='user',
                                          lazy=True)
    assessment_records = db.relationship('AssessmentRecord',
                                         backref='user',
                                         lazy=True)


class Conversation(db.Model):
    """用户与AI的对话记录表"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user_message = db.Column(db.Text, nullable=False)
    ai_response = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class BreathingSession(db.Model):
    """情绪调节器（呼吸引导）记录表"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    duration_seconds = db.Column(db.Integer, nullable=False)  # 引导时长（秒）
    technique = db.Column(db.String(50))  # 引导技巧，如“4-7-8呼吸”
    calm_level_before = db.Column(db.Integer)  # 引导前平静度 (1-10)
    calm_level_after = db.Column(db.Integer)  # 引导后平静度 (1-10)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class MeditationSession(db.Model):
    """冥想室记录表"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    duration_seconds = db.Column(db.Integer, nullable=False)  # 冥想时长（秒）
    theme = db.Column(db.String(50))  # 冥想主题
    feeling_after = db.Column(db.String(200))  # 冥想后感受
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class AssessmentRecord(db.Model):
    """心理状态测评记录表"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    assessment_type = db.Column(db.String(50), nullable=False)  # 测评类型，如“压力自评”
    score = db.Column(db.String(50), nullable=False)  # 得分或结果
    summary = db.Column(db.Text)  # 结果摘要或建议
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


# ---------- 4. 初始化数据库（首次运行后可以注释掉下面三行） ----------
with app.app_context():
    db.create_all()
    print("[初始化] 数据库表创建成功！如果已存在，则无变化。")

# ---------- 5. 定义所有API路由（你的网站接口） ----------


@app.route('/')
def home():
    # 这行代码会自动在 `templates` 文件夹里寻找 `index.html` 并渲染
    return render_template('index.html')

@app.route('/health', methods=['GET'])
def health_check():
    """健康检查接口，用于确认服务是否在线"""
    return jsonify({
        "status": "ok",
        "message": "后端服务运行正常",
        "timestamp": datetime.utcnow().isoformat()
    })


# ---------- 5.1 用户认证接口 ----------
@app.route('/api/register', methods=['POST'])
def register():
    """用户注册接口"""
    data = request.json
    phone = data.get('phone')
    password = data.get('password')
    nickname = data.get('nickname', '')

    # 检查手机号是否已注册
    if User.query.filter_by(phone=phone).first():
        return jsonify({'success': False, 'error': '手机号已注册'}), 400

    # 加密密码并创建用户
    hashed_pw = generate_password_hash(password)
    new_user = User(phone=phone, password_hash=hashed_pw, nickname=nickname)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': '注册成功',
        'user_id': new_user.id
    }), 201


@app.route('/api/login', methods=['POST'])
def login():
    """用户登录接口"""
    data = request.json
    phone = data.get('phone')
    password = data.get('password')

    user = User.query.filter_by(phone=phone).first()
    # 验证用户存在且密码正确
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'success': False, 'error': '手机号或密码错误'}), 401

    # 登录成功，在session中记录用户ID
    session['user_id'] = user.id
    return jsonify({
        'success': True,
        'message': '登录成功',
        'user_id': user.id,
        'nickname': user.nickname
    })


# ---------- 5.2 核心功能接口（所有接口都需要用户已登录） ----------


def login_required(func):
    """一个简单的装饰器，用于检查用户是否登录"""
    from functools import wraps

    @wraps(func)
    def wrapper(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'success': False, 'error': '请先登录'}), 401
        return func(*args, **kwargs)

    return wrapper


@app.route('/api/chat', methods=['POST'])
@login_required
def chat_with_ai():
    """AI对话接口（当前为模拟回复，未来可接入真实AI）"""
    data = request.json
    user_message = data.get('message', '')

    # 这里是AI处理逻辑（示例为模拟回复）
    ai_response = f"[模拟回复] 我已收到：'{user_message[:30]}...'。当前服务为演示模式。"

    # 将对话记录到数据库
    new_conversation = Conversation(user_id=session['user_id'],
                                    user_message=user_message,
                                    ai_response=ai_response)
    db.session.add(new_conversation)
    db.session.commit()

    return jsonify({
        'success': True,
        'reply': ai_response,
        'conversation_id': new_conversation.id
    })


@app.route('/api/breathing/session', methods=['POST'])
@login_required
def record_breathing():
    """记录一次情绪调节（呼吸引导）的会话"""
    data = request.json
    new_session = BreathingSession(
        user_id=session['user_id'],
        duration_seconds=data.get('duration_seconds', 60),
        technique=data.get('technique', '腹式呼吸'),
        calm_level_before=data.get('calm_level_before', 5),
        calm_level_after=data.get('calm_level_after', 7))
    db.session.add(new_session)
    db.session.commit()
    return jsonify({
        'success': True,
        'message': '呼吸引导记录已保存',
        'session_id': new_session.id
    })


@app.route('/api/meditation/session', methods=['POST'])
@login_required
def record_meditation():
    """记录一次冥想会话"""
    data = request.json
    new_session = MeditationSession(
        user_id=session['user_id'],
        duration_seconds=data.get('duration_seconds', 300),
        theme=data.get('theme', '正念呼吸'),
        feeling_after=data.get('feeling_after', '感觉平静'))
    db.session.add(new_session)
    db.session.commit()
    return jsonify({
        'success': True,
        'message': '冥想记录已保存',
        'session_id': new_session.id
    })


@app.route('/api/assessment/record', methods=['POST'])
@login_required
def record_assessment():
    """记录一次心理测评结果"""
    data = request.json
    new_record = AssessmentRecord(user_id=session['user_id'],
                                  assessment_type=data.get(
                                      'assessment_type', '压力自评量表'),
                                  score=data.get('score', '0'),
                                  summary=data.get('summary', '测试结果摘要'))
    db.session.add(new_record)
    db.session.commit()
    return jsonify({
        'success': True,
        'message': '测评记录已保存',
        'record_id': new_record.id
    })
    
# 呼吸引导页面
@app.route('/breathing')
def breathing_page():
    return render_template('breathing.html')

# 心理测评页面
@app.route('/assessment')
def assessment_page():
    return render_template('assessment.html')

# 冥想室页面
@app.route('/meditation')
def meditation_page():
    return render_template('meditation.html')


# ---------- 6. 启动服务器 ----------
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    print("✅ 后端服务器正在启动...")
    print(f"🌐 本地访问: http://127.0.0.1:{port}")
    print("🔧 数据库文件: mental_health.db")
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))
