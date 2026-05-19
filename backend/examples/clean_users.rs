use std::env;

use dotenvy::dotenv;
use sqlx::postgres::PgPoolOptions;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv().ok();

    let database_url = env::var("DATABASE_URL").map_err(|_| "DATABASE_URL must be set")?;

    let pool = PgPoolOptions::new()
        .max_connections(1)
        .connect(&database_url)
        .await?;

    let before: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM users")
        .fetch_one(&pool)
        .await?;

    sqlx::query("TRUNCATE TABLE users CASCADE")
        .execute(&pool)
        .await?;

    let after: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM users")
        .fetch_one(&pool)
        .await?;

    println!("Users before cleanup: {}", before);
    println!("Users after cleanup: {}", after);

    Ok(())
}
