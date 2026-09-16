# Speaksy — modelos SQLAlchemy (mapea database/schema.sql)
# Estado: ESCRITO, NO EJECUTADO/PROBADO en este entorno.

from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(180), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    profile_image = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    sessions = db.relationship("ExerciseSession", backref="user", lazy=True)
    goals = db.relationship("PracticeGoal", backref="user", lazy=True)


class Exercise(db.Model):
    __tablename__ = "exercises"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(160), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(40), nullable=False)
    difficulty = db.Column(db.String(20), default="beginner")
    duration = db.Column(db.Integer, nullable=False)
    instructions = db.Column(db.Text)


class ExerciseSession(db.Model):
    __tablename__ = "exercise_sessions"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    exercise_id = db.Column(db.Integer, db.ForeignKey("exercises.id"), nullable=False)
    duration = db.Column(db.Integer)
    completed = db.Column(db.Boolean, default=False)
    score = db.Column(db.Integer)
    feedback = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class PracticeGoal(db.Model):
    __tablename__ = "practice_goals"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    goal_type = db.Column(db.String(40), nullable=False)
    target = db.Column(db.Integer, nullable=False)
    current_progress = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Conversation(db.Model):
    __tablename__ = "conversations"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    finished_at = db.Column(db.DateTime)
    topic = db.Column(db.String(80))


class Message(db.Model):
    __tablename__ = "messages"
    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.Integer, db.ForeignKey("conversations.id"), nullable=False)
    sender = db.Column(db.String(10), nullable=False)  # 'user' | 'ai'
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class VoiceSession(db.Model):
    __tablename__ = "voice_sessions"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    exercise_id = db.Column(db.Integer, db.ForeignKey("exercises.id"))
    duration = db.Column(db.Integer)
    words_detected = db.Column(db.Integer)
    speaking_rate = db.Column(db.Numeric(6, 2))
    pause_count = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Achievement(db.Model):
    __tablename__ = "achievements"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text)
    icon = db.Column(db.String(10))
    requirement = db.Column(db.String(160), nullable=False)


class UserAchievement(db.Model):
    __tablename__ = "user_achievements"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    achievement_id = db.Column(db.Integer, db.ForeignKey("achievements.id"), nullable=False)
    unlocked_at = db.Column(db.DateTime, default=datetime.utcnow)
    __table_args__ = (db.UniqueConstraint("user_id", "achievement_id"),)


class DailyActivity(db.Model):
    __tablename__ = "daily_activity"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    date = db.Column(db.Date, nullable=False)
    minutes = db.Column(db.Integer, default=0)
    sessions = db.Column(db.Integer, default=0)
    __table_args__ = (db.UniqueConstraint("user_id", "date"),)
