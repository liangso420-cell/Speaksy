# Speaksy — Flask API (secciones 20-21 del PRD)
# Estado: ESCRITO, NO EJECUTADO/PROBADO en este entorno (sin acceso a red para
# instalar dependencias ni levantar PostgreSQL). Revisar STATUS.md.

import os
from datetime import datetime, timedelta

from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import jwt

from models import db, User, Exercise, ExerciseSession, PracticeGoal, Achievement

JWT_SECRET = os.environ.get("JWT_SECRET", "change-me")


def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
        "DATABASE_URL", "postgresql://localhost/speaksy"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    db.init_app(app)
    CORS(app)

    # ---------- helpers ----------
    def make_token(user_id):
        payload = {"sub": user_id, "exp": datetime.utcnow() + timedelta(days=7)}
        return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

    def current_user():
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return None
        try:
            payload = jwt.decode(auth.split(" ", 1)[1], JWT_SECRET, algorithms=["HS256"])
            return User.query.get(payload["sub"])
        except jwt.PyJWTError:
            return None

    def require_auth():
        user = current_user()
        if not user:
            return None, (jsonify({"error": "No autorizado"}), 401)
        return user, None

    # ---------- auth ----------
    @app.post("/api/auth/register")
    def register():
        data = request.get_json(force=True)
        if User.query.filter_by(email=data.get("email")).first():
            return jsonify({"error": "El correo ya está registrado"}), 409
        user = User(
            name=data["name"],
            email=data["email"],
            password_hash=generate_password_hash(data["password"]),
        )
        db.session.add(user)
        db.session.commit()
        return jsonify({"token": make_token(user.id)}), 201

    @app.post("/api/auth/login")
    def login():
        data = request.get_json(force=True)
        user = User.query.filter_by(email=data.get("email")).first()
        if not user or not check_password_hash(user.password_hash, data.get("password", "")):
            return jsonify({"error": "Credenciales inválidas"}), 401
        return jsonify({"token": make_token(user.id)})

    # ---------- users ----------
    @app.get("/api/users/me")
    def get_me():
        user, err = require_auth()
        if err:
            return err
        return jsonify({"id": user.id, "name": user.name, "email": user.email})

    @app.put("/api/users/me")
    def update_me():
        user, err = require_auth()
        if err:
            return err
        data = request.get_json(force=True)
        user.name = data.get("name", user.name)
        db.session.commit()
        return jsonify({"ok": True})

    # ---------- exercises ----------
    @app.get("/api/exercises")
    def list_exercises():
        category = request.args.get("category")
        q = Exercise.query
        if category:
            q = q.filter_by(category=category)
        return jsonify([
            {"id": e.id, "name": e.name, "category": e.category, "duration": e.duration}
            for e in q.all()
        ])

    @app.get("/api/exercises/<int:exercise_id>")
    def get_exercise(exercise_id):
        e = Exercise.query.get_or_404(exercise_id)
        return jsonify({
            "id": e.id, "name": e.name, "description": e.description,
            "category": e.category, "duration": e.duration, "instructions": e.instructions,
        })

    @app.post("/api/exercises/<int:exercise_id>/start")
    def start_exercise(exercise_id):
        user, err = require_auth()
        if err:
            return err
        session = ExerciseSession(user_id=user.id, exercise_id=exercise_id, completed=False)
        db.session.add(session)
        db.session.commit()
        return jsonify({"session_id": session.id}), 201

    @app.post("/api/exercises/<int:exercise_id>/complete")
    def complete_exercise(exercise_id):
        user, err = require_auth()
        if err:
            return err
        data = request.get_json(force=True)
        session = ExerciseSession.query.get_or_404(data["session_id"])
        session.completed = True
        session.duration = data.get("duration")
        session.feedback = data.get("feedback")
        db.session.commit()
        # TODO(fase 10/11): actualizar daily_activity y comprobar achievements
        return jsonify({"ok": True})

    # ---------- progress / history / goals ----------
    @app.get("/api/progress")
    def progress():
        user, err = require_auth()
        if err:
            return err
        sessions = ExerciseSession.query.filter_by(user_id=user.id, completed=True).all()
        return jsonify({
            "sessions": len(sessions),
            "minutes": sum((s.duration or 0) for s in sessions) // 60,
        })

    @app.get("/api/history")
    def history():
        user, err = require_auth()
        if err:
            return err
        sessions = ExerciseSession.query.filter_by(user_id=user.id).order_by(
            ExerciseSession.created_at.desc()
        ).all()
        return jsonify([
            {"id": s.id, "exercise_id": s.exercise_id, "completed": s.completed,
             "duration": s.duration, "created_at": s.created_at.isoformat()}
            for s in sessions
        ])

    @app.get("/api/goals")
    def list_goals():
        user, err = require_auth()
        if err:
            return err
        goals = PracticeGoal.query.filter_by(user_id=user.id).all()
        return jsonify([
            {"id": g.id, "goal_type": g.goal_type, "target": g.target,
             "current_progress": g.current_progress}
            for g in goals
        ])

    @app.post("/api/goals")
    def create_goal():
        user, err = require_auth()
        if err:
            return err
        data = request.get_json(force=True)
        goal = PracticeGoal(user_id=user.id, goal_type=data["goal_type"], target=data["target"])
        db.session.add(goal)
        db.session.commit()
        return jsonify({"id": goal.id}), 201

    @app.get("/api/achievements")
    def list_achievements():
        return jsonify([{"id": a.id, "name": a.name, "icon": a.icon} for a in Achievement.query.all()])

    # ---------- conversations (IA) — ver ai_service.py ----------
    @app.get("/api/conversations")
    def list_conversations():
        # TODO(fase 8): implementar listado real
        return jsonify([])

    @app.post("/api/conversations")
    def create_conversation():
        # TODO(fase 8): crear conversación + primer mensaje de la IA vía ai_service
        return jsonify({"error": "No implementado todavía"}), 501

    @app.post("/api/conversations/<int:conversation_id>/message")
    def send_message(conversation_id):
        # TODO(fase 8): guardar mensaje del usuario, llamar ai_service, guardar respuesta
        return jsonify({"error": "No implementado todavía"}), 501

    # ---------- voice analysis ----------
    @app.post("/api/voice/analyze")
    def analyze_voice():
        # TODO(fase 9): requiere integrar una Speech-to-Text API real.
        # No devolver nunca resultados simulados como si fueran reales (sección 23/11 del PRD).
        return jsonify({"error": "Análisis de voz no conectado todavía"}), 501

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
