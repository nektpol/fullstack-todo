use axum::{
    Router,
    routing::{post, delete},
    extract::{State, Path},
    Json,
};
use uuid::Uuid;
use serde::Deserialize;
use chrono::{Datelike, Duration, NaiveDate, NaiveDateTime, Utc};

use crate::middleware::auth::AuthenticatedUser;
use crate::state::AppState;
use crate::models::todo::Todo;

pub fn todo_routes() -> Router<AppState> {
    Router::new()
        .route("/", post(create_todo).get(get_todos))
        .route("/{id}", delete(delete_todo).put(update_todo))
        .route("/{id}/complete", post(mark_todo_done))
}

struct TodoRow {
    id: Uuid,
    user_id: Uuid,
    title: String,
    description: Option<String>,
    frequency: String,
    created_at: NaiveDateTime,
    completed_at: Option<NaiveDateTime>,
}

fn is_valid_frequency(frequency: &str) -> bool {
    matches!(frequency, "daily" | "weekly" | "monthly")
}

fn current_period_start_utc(frequency: &str, now: chrono::DateTime<Utc>) -> Option<NaiveDateTime> {
    let date = now.date_naive();

    match frequency {
        "daily" => date.and_hms_opt(0, 0, 0),
        "weekly" => {
            let monday = date - Duration::days(date.weekday().num_days_from_monday() as i64);
            monday.and_hms_opt(0, 0, 0)
        }
        "monthly" => NaiveDate::from_ymd_opt(date.year(), date.month(), 1)
            .and_then(|d| d.and_hms_opt(0, 0, 0)),
        _ => None,
    }
}

#[derive(Deserialize)]
pub struct UpdateTodoRequest {
    pub title: String,
    pub description: Option<String>,
    pub frequency: String,
}

#[derive(Deserialize)]
pub struct CreateTodoRequest {
    pub title: String,
    pub description: Option<String>,
    pub frequency: String,
}

pub async fn get_todos(
    State(state): State<AppState>,
    user: AuthenticatedUser,
) -> Result<Json<Vec<Todo>>, (axum::http::StatusCode, String)> {

    let user_id = Uuid::parse_str(&user.user_id)
        .map_err(|_| (axum::http::StatusCode::BAD_REQUEST, "Invalid user id".to_string()))?;

    let rows = sqlx::query_as!(
        TodoRow,
        r#"
        SELECT
            t.id,
            t.user_id,
            t.title,
            t.description,
            t.frequency,
            t.created_at,
            c.completed_at as "completed_at?"
        FROM todos t
        LEFT JOIN todo_completions c
            ON c.todo_id = t.id
            AND c.period_start = CASE
                WHEN t.frequency = 'daily' THEN date_trunc('day', now() AT TIME ZONE 'UTC')
                WHEN t.frequency = 'weekly' THEN date_trunc('week', now() AT TIME ZONE 'UTC')
                WHEN t.frequency = 'monthly' THEN date_trunc('month', now() AT TIME ZONE 'UTC')
                ELSE NULL
            END
        WHERE t.user_id = $1
        ORDER BY t.created_at DESC
        "#,
        user_id
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| (
        axum::http::StatusCode::INTERNAL_SERVER_ERROR,
        e.to_string()
    ))?;

    let todos = rows
        .into_iter()
        .map(|row| Todo {
            id: row.id,
            user_id: row.user_id,
            title: row.title,
            description: row.description,
            frequency: row.frequency,
            created_at: row.created_at,
            is_done: row.completed_at.is_some(),
            completed_at: row.completed_at,
        })
        .collect();

    Ok(Json(todos))
}



pub async fn create_todo(
    State(state): State<AppState>,
    user: AuthenticatedUser,
    Json(payload): Json<CreateTodoRequest>,
) -> Result<Json<String>, (axum::http::StatusCode, String)> {

    let todo_id = Uuid::new_v4();
    let user_id = Uuid::parse_str(&user.user_id)
        .map_err(|_| (axum::http::StatusCode::BAD_REQUEST, "Invalid user id".to_string()))?;

    if !is_valid_frequency(&payload.frequency) {
        return Err((
            axum::http::StatusCode::BAD_REQUEST,
            "Invalid frequency. Allowed: daily, weekly, monthly".to_string(),
        ));
    }

    sqlx::query!(
        r#"
        INSERT INTO todos (id, user_id, title, description, frequency)
        VALUES ($1, $2, $3, $4, $5)
        "#,
        todo_id,
        user_id,
        payload.title,
        payload.description,
        payload.frequency
    )
    .execute(&state.db)
    .await
    .map_err(|e| (
        axum::http::StatusCode::INTERNAL_SERVER_ERROR,
        e.to_string()
    ))?;

    Ok(Json("Todo created".to_string()))
}

pub async fn delete_todo(
    State(state): State<AppState>,
    user: AuthenticatedUser,
    Path(todo_id): Path<Uuid>,
) -> Result<Json<String>, (axum::http::StatusCode, String)> {

    let user_id = Uuid::parse_str(&user.user_id)
        .map_err(|_| (
            axum::http::StatusCode::BAD_REQUEST,
            "Invalid user id".to_string()
        ))?;

    sqlx::query!(
        r#"
        DELETE FROM todos
        WHERE id = $1 AND user_id = $2
        "#,
        todo_id,
        user_id
    )
    .execute(&state.db)
    .await
    .map_err(|e| (
        axum::http::StatusCode::INTERNAL_SERVER_ERROR,
        e.to_string()
    ))?;

    Ok(Json("Todo deleted".to_string()))
}

pub async fn update_todo(
    State(state): State<AppState>,
    user: AuthenticatedUser,
    Path(todo_id): Path<Uuid>,
    Json(payload): Json<UpdateTodoRequest>,
) -> Result<Json<String>, (axum::http::StatusCode, String)> {

    let user_id = Uuid::parse_str(&user.user_id)
        .map_err(|_| (
            axum::http::StatusCode::BAD_REQUEST,
            "Invalid user id".to_string()
        ))?;

    if !is_valid_frequency(&payload.frequency) {
        return Err((
            axum::http::StatusCode::BAD_REQUEST,
            "Invalid frequency. Allowed: daily, weekly, monthly".to_string(),
        ));
    }

    sqlx::query!(
        r#"
        UPDATE todos
        SET
            title = $1,
            description = $2,
            frequency = $3
        WHERE id = $4
        AND user_id = $5
        "#,
        payload.title,
        payload.description,
        payload.frequency,
        todo_id,
        user_id
    )
    .execute(&state.db)
    .await
    .map_err(|e| (
        axum::http::StatusCode::INTERNAL_SERVER_ERROR,
        e.to_string()
    ))?;

    Ok(Json("Todo updated".to_string()))
}

pub async fn mark_todo_done(
    State(state): State<AppState>,
    user: AuthenticatedUser,
    Path(todo_id): Path<Uuid>,
) -> Result<Json<String>, (axum::http::StatusCode, String)> {
    let user_id = Uuid::parse_str(&user.user_id)
        .map_err(|_| (
            axum::http::StatusCode::BAD_REQUEST,
            "Invalid user id".to_string()
        ))?;

    let todo = sqlx::query!(
        r#"
        SELECT frequency
        FROM todos
        WHERE id = $1 AND user_id = $2
        "#,
        todo_id,
        user_id
    )
    .fetch_optional(&state.db)
    .await
    .map_err(|e| (
        axum::http::StatusCode::INTERNAL_SERVER_ERROR,
        e.to_string()
    ))?;

    let todo = todo.ok_or((
        axum::http::StatusCode::NOT_FOUND,
        "Todo not found".to_string(),
    ))?;

    let period_start = current_period_start_utc(&todo.frequency, Utc::now()).ok_or((
        axum::http::StatusCode::BAD_REQUEST,
        "Invalid frequency. Allowed: daily, weekly, monthly".to_string(),
    ))?;

    sqlx::query!(
        r#"
        INSERT INTO todo_completions (id, todo_id, completed_at, period_start, period_type)
        VALUES ($1, $2, NOW(), $3, $4)
        ON CONFLICT (todo_id, period_start)
        DO UPDATE SET
            completed_at = EXCLUDED.completed_at,
            period_type = EXCLUDED.period_type
        "#,
        Uuid::new_v4(),
        todo_id,
        period_start,
        todo.frequency
    )
    .execute(&state.db)
    .await
    .map_err(|e| (
        axum::http::StatusCode::INTERNAL_SERVER_ERROR,
        e.to_string()
    ))?;

    Ok(Json("Todo marked as done".to_string()))
}
