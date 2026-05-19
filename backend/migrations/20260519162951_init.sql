-- Add migration script here
-- USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- TODOS TABLE
CREATE TABLE todos (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    frequency TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- COMPLETIONS TABLE (TRACK PROGRESS)
CREATE TABLE todo_completions (
    id UUID PRIMARY KEY,
    todo_id UUID NOT NULL,
    completed_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_todo
        FOREIGN KEY (todo_id)
        REFERENCES todos(id)
        ON DELETE CASCADE
);