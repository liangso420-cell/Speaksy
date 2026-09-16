-- Speaksy — esquema PostgreSQL (sección 19 del PRD)
-- Estado: DISEÑADO, NO EJECUTADO EN ESTE ENTORNO (sin acceso a red/DB aquí).

CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(120)        NOT NULL,
    email           VARCHAR(180) UNIQUE NOT NULL,
    password_hash   VARCHAR(255)        NOT NULL,
    profile_image   VARCHAR(255),
    created_at      TIMESTAMP           NOT NULL DEFAULT NOW()
);

CREATE TABLE exercises (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(160)        NOT NULL,
    description     TEXT,
    category        VARCHAR(40)         NOT NULL, -- breathing|rhythm|reading|words|pronunciation|conversation
    difficulty      VARCHAR(20)         NOT NULL DEFAULT 'beginner',
    duration        INTEGER             NOT NULL, -- minutos estimados
    instructions    TEXT
);

CREATE TABLE exercise_sessions (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_id     INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    duration        INTEGER,           -- segundos reales
    completed       BOOLEAN NOT NULL DEFAULT FALSE,
    score           INTEGER,
    feedback        TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_sessions_user ON exercise_sessions(user_id);

CREATE TABLE practice_goals (
    id                  SERIAL PRIMARY KEY,
    user_id             INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_type           VARCHAR(40) NOT NULL, -- daily_minutes|weekly_sessions
    target              INTEGER NOT NULL,
    current_progress    INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_goals_user ON practice_goals(user_id);

CREATE TABLE conversations (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    started_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    finished_at     TIMESTAMP,
    topic           VARCHAR(80)
);
CREATE INDEX idx_conversations_user ON conversations(user_id);

CREATE TABLE messages (
    id              SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender          VARCHAR(10) NOT NULL, -- user|ai
    message         TEXT NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);

CREATE TABLE voice_sessions (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_id     INTEGER REFERENCES exercises(id) ON DELETE SET NULL,
    duration        INTEGER,
    words_detected  INTEGER,
    speaking_rate   NUMERIC(6,2),
    pause_count     INTEGER,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_voice_sessions_user ON voice_sessions(user_id);

CREATE TABLE achievements (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(120) NOT NULL,
    description     TEXT,
    icon            VARCHAR(10),
    requirement     VARCHAR(160) NOT NULL -- ej. 'sessions>=10'
);

CREATE TABLE user_achievements (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id  INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, achievement_id)
);

CREATE TABLE daily_activity (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date            DATE NOT NULL,
    minutes         INTEGER NOT NULL DEFAULT 0,
    sessions        INTEGER NOT NULL DEFAULT 0,
    UNIQUE (user_id, date)
);
CREATE INDEX idx_daily_activity_user ON daily_activity(user_id, date);
