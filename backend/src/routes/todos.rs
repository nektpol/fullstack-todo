use axum::{
    Router,
    routing::{get, post, delete, put},
    extract::{State, Path},
    Json,
};
use uuid::Uuid;
use serde::Deserialize;

use crate::middleware::auth::AuthenticatedUser;
use crate::state::AppState;
use crate::models::todo::Todo;

pub fn todo_routes() -> Router<AppState> {
    Router::new()
        .route("/", post(create_todo).get(get_todos))
        .route("/{id}", delete(delete_todo).put(update_todo))
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

    let todos = sqlx::query_as!(
        Todo,
        r#"
        SELECT id, user_id, title, description, frequency, created_at
        FROM todos
        WHERE user_id = $1
        ORDER BY created_at DESC
        "#,
        user_id
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| (
        axum::http::StatusCode::INTERNAL_SERVER_ERROR,
        e.to_string()
    ))?;

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
