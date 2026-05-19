use axum::Router;
use dotenvy::dotenv;
use std::env;

mod db;
mod models;
mod routes;
mod services;
mod state;
mod error;
mod middleware;

use state::AppState;
use routes::{auth::auth_routes, todos::todo_routes};

#[tokio::main]
async fn main() {
    dotenv().ok();

    let database_url = env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set");

    let db = db::create_pool(&database_url).await;

    let state = AppState { db };

    let app = Router::new()
        .nest("/auth", auth_routes())
        .nest("/todos", todo_routes())
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000")
        .await
        .unwrap();

    println!("Server running");

    axum::serve(listener, app)
        .await
        .unwrap();
}