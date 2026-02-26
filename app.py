# -*- coding: utf-8 -*-
"""
心理健康应用后端 - 无登录版
功能：AI对话、呼吸、冥想、测评记录
"""

from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///mental_health.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key = os.environ.get('SECRET_KEY', 'dev-key')

db = SQLAlchemy(app)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nickname = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)


class Conversation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user_message = db.Column(db.Text, nullable=False)
    ai_response = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)


class BreathingSession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    duration_seconds = db.Column(db.Integer, nullable=False)
    technique = db.Column(db.String(50))
    calm_level_before = db.Column(db.Integer)
    calm_level_after = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)


class MeditationSession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    duration_seconds = db.Column(db.Integer, nullable=False)
    theme = db.Column(db.String(50))
    feeling_after = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)


class AssessmentRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    assessment_type = db.Column(db.String(50), nullable=False)
    score = db.Column(db.String(50), nullable=False)
    summary = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)


with app.app_context():
    db.create_all()
    if not User.query.get(1):
        db.session.add(User(id=1, nickname="默认用户"))
        db.session.commit()
        print("✅ 默认用户已创建")


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/health')
@app.route('/health.html')
def health():
    return jsonify({"status": "ok"})


@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    msg = data.get('message', '')
    reply = f"[模拟] 收到：{msg[:30]}..."
    conv = Conversation(user_id=1, user_message=msg, ai_response=reply)
    db.session.add(conv)
    db.session.commit()
    return jsonify({"success": True, "reply": reply})


@app.route('/api/breathing/session', methods=['POST'])
def record_breathing():
    data = request.json
    record = BreathingSession(
        user_id=1,
        duration_seconds=data.get('duration_seconds', 0),
        technique=data.get('technique', '4-4-6呼吸法'),
        calm_level_before=data.get('calm_level_before'),
        calm_level_after=data.get('calm_level_after')
    )
    db.session.add(record)
    db.session.commit()
    return jsonify({"message": "记录成功", "id": record.id})


@app.route('/api/meditation/session', methods=['POST'])
def record_meditation():
    data = request.json
    record = MeditationSession(
        user_id=1,
        duration_seconds=data.get('duration_seconds', 0),
        theme=data.get('theme', '正念冥想'),
        feeling_after=data.get('feeling_after', '放松')
    )
    db.session.add(record)
    db.session.commit()
    return jsonify({"message": "记录成功", "id": record.id})


@app.route('/api/assessment/record', methods=['POST'])
def record_assessment():
    data = request.json
    record = AssessmentRecord(
        user_id=1,
        assessment_type=data.get('assessment_type', '抑郁焦虑筛查'),
        score=data.get('score', '0'),
        summary=data.get('summary', '')
    )
    db.session.add(record)
    db.session.commit()
    print(f"✅ 测评保存 ID={record.id}")
    return jsonify({"message": "记录成功", "id": record.id})


@app.route('/breathing')
@app.route('/breathing.html')
def breathing_page():
    return render_template('breathing.html')


@app.route('/assessment')
@app.route('/assessment.html')
def assessment_page():
    return render_template('assessment.html')


@app.route('/meditation')
@app.route('/meditation.html')
def meditation_page():
    return render_template('meditation.html')


@app.route('/tree')
@app.route('/tree.html')
def meditation_page():
    return render_template('tree.html')

@app.route('/home')
@app.route('/home.html')
def meditation_page():
    return render_template('home.html')


@app.route('/daka')
@app.route('/daka.html')
def meditation_page():
    return render_template('daka.html')


@app.route('/knowledge')
@app.route('/knowledge.html')
def meditation_page():
    return render_template('meditation.html')



if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
