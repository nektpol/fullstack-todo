use argon2::password_hash::{rand_core::OsRng, SaltString};
use argon2::{Argon2, PasswordHasher, PasswordHash, PasswordVerifier};
use axum::{extract::State, routing::post, Json, Router, http::StatusCode};
use regex::Regex;
use serde::{Deserialize, Serialize};
use sqlx::query;
use uuid::Uuid;
use std::env;
use std::sync::LazyLock;

use crate::services::jwt_service::create_token;
use crate::state::AppState;

#[derive(Deserialize)]
pub struct RegisterRequest {
    pub username: String,
    pub email: String,
    pub password: String,
}

#[derive(Serialize)]
pub struct AuthResponse {
    pub message: String,
}

#[derive(Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug)]
struct DbUser {
    id: uuid::Uuid,
    password_hash: String,
}

static EMAIL_RE: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$")
        .expect("email regex must be valid")
});

fn is_valid_email(email: &str) -> bool {
    EMAIL_RE.is_match(email)
}

fn password_policy_errors(password: &str) -> Vec<&'static str> {
    let mut errors = Vec::new();

    if password.len() < 12 {
        errors.push("Password must be at least 12 characters long");
    }
    if !password.chars().any(|c| c.is_ascii_uppercase()) {
        errors.push("Password must include at least one uppercase letter");
    }
    if !password.chars().any(|c| c.is_ascii_lowercase()) {
        errors.push("Password must include at least one lowercase letter");
    }
    if !password.chars().any(|c| c.is_ascii_digit()) {
        errors.push("Password must include at least one number");
    }
    if !password.chars().any(|c| !c.is_ascii_alphanumeric()) {
        errors.push("Password must include at least one special character");
    }
    if password.chars().any(|c| c.is_whitespace()) {
        errors.push("Password cannot contain spaces");
    }

    errors
}

pub fn auth_routes() -> Router<AppState> {
    Router::new()
        .route("/register", post(register))
        .route("/login", post(login))
}



pub async fn register(
    State(state): State<AppState>,
    Json(payload): Json<RegisterRequest>,
) -> Result<Json<AuthResponse>, (axum::http::StatusCode, String)> {

    let normalized_email = payload.email.trim().to_lowercase();
    if !is_valid_email(&normalized_email) {
        return Err((StatusCode::BAD_REQUEST, "Invalid email format".to_string()));
    }

    let password_errors = password_policy_errors(&payload.password);
    if !password_errors.is_empty() {
        return Err((
            StatusCode::BAD_REQUEST,
            password_errors.join(". "),
        ));
    }

    // 1. Generate user ID
    let user_id = Uuid::new_v4();

    // 2. Hash password (secure way)
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();

    let password_hash = argon2
        .hash_password(payload.password.as_bytes(), &salt)
        .map_err(|_| (
            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            "Password hashing failed".to_string()
        ))?
        .to_string();

    // 3. Insert into database
    let result = query!(
        r#"
        INSERT INTO users (id, username, email, password_hash)
        VALUES ($1, $2, $3, $4)
        "#,
        user_id,
        payload.username,
        normalized_email,
        password_hash
    )
    .execute(&state.db)
    .await;

    // 4. Handle DB errors (important for portfolio quality)
    match result {
    Ok(_) => Ok(Json(AuthResponse {
        message: "User created successfully".to_string(),
    })),

    Err(sqlx::Error::Database(db_err)) => {
        let message = db_err.message();

        // DEBUG LOG (VERY IMPORTANT)
        println!("DB ERROR: {}", message);

        if message.contains("duplicate key") && message.contains("email") {
            return Err((
                axum::http::StatusCode::CONFLICT,
                "Email already exists".to_string(),
            ));
        }

        Err((
            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            message.to_string(),
        ))
    }

    Err(e) => {
        println!("UNKNOWN ERROR: {:?}", e);

        Err((
            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            "Unexpected error".to_string(),
        ))
    }
    }
}

pub async fn login(
    State(state): State<AppState>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<serde_json::Value>, (StatusCode, String)> {

    let normalized_email = payload.email.trim().to_lowercase();
    if !is_valid_email(&normalized_email) {
        return Err((StatusCode::BAD_REQUEST, "Invalid email format".to_string()));
    }

    // 1. Fetch user by email
    let user = sqlx::query_as!(
        DbUser,
        r#"
        SELECT id, password_hash
        FROM users
        WHERE email = $1
        "#,
        normalized_email
    )
    .fetch_optional(&state.db)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "DB error".to_string()))?;

    let user = match user {
        Some(u) => u,
        None => return Err((StatusCode::UNAUTHORIZED, "Invalid credentials".to_string())),
    };

    // 2. Verify password
    let parsed_hash = PasswordHash::new(&user.password_hash)
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Hash parse error".to_string()))?;

    let argon2 = Argon2::default();

    if argon2.verify_password(payload.password.as_bytes(), &parsed_hash).is_err() {
        return Err((StatusCode::UNAUTHORIZED, "Invalid credentials".to_string()));
    }

    // 3. Generate JWT
    let secret = env::var("JWT_SECRET")
        .expect("JWT_SECRET must be set");

    let token = create_token(user.id.to_string(), &secret);

    // 4. Return token
    Ok(Json(serde_json::json!({
        "token": token
    })))
}