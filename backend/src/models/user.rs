use serde::{Serialize, Deserialize};
use uuid::Uuid;

#[allow(dead_code)]
#[derive(Debug, Serialize, Deserialize)]
pub struct User {
    pub id: Uuid,
    pub username: String,
    pub email: String,
    pub password_hash: String,
}