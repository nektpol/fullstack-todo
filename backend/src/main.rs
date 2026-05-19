use std::env;

use axum::{Router, http::Method};
use dotenvy::dotenv;
use tokio;

use tower_http::cors::{CorsLayer, Any};

mod db;
mod state;
mod routes;
mod middleware;
mod models;
mod services;

use state::AppState;
use routes::auth::auth_routes;
use routes::todos::todo_routes;

#[tokio::main]
async fn main() {
    dotenv().ok();

    let database_url = env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set");

    let db = db::create_pool(&database_url).await;

    let state = AppState { db };

    let cors = CorsLayer::new()
        .allow_origin("http://localhost:3001".parse::<axum::http::HeaderValue>().unwrap())
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_headers(Any);

    let app = Router::new()
        .nest("/auth", auth_routes())
        .nest("/todos", todo_routes())
        .layer(cors)
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000")
        .await
        .unwrap();

    println!("Server running on http://localhost:3000");

    axum::serve(listener, app)
        .await
        .unwrap();
}