use argon2::{
  password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
  Algorithm::Argon2id,
  Argon2, Params, Version,
};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct HashOptions {
  pub time_cost: u32,
  pub memory_cost: u32,
  pub parallelism: u32,
}

#[wasm_bindgen]
pub fn hash(password: &str, options: Option<HashOptions>) -> Result<String, JsError> {
  let salt = SaltString::generate(&mut OsRng);

  let argon2 = match options {
    Some(opts) => {
      let params = Params::new(opts.memory_cost, opts.time_cost, opts.parallelism, None)
        .map_err(|e| JsError::new(&e.to_string()))?;

      Ok::<Argon2, JsError>(Argon2::new(Argon2id, Version::default(), params))
    }

    None => Ok(Argon2::default()),
  }?;

  argon2
    .hash_password(password.as_bytes(), &salt)
    .map(|password_hash| password_hash.to_string())
    .map_err(|e| JsError::new(&e.to_string()))
}

#[wasm_bindgen]
pub fn verify(password: &str, hash: &str) -> Result<bool, JsError> {
  let password_hash = PasswordHash::new(hash).map_err(|e| JsError::new(&e.to_string()))?;

  let argon2 = Argon2::default();

  match argon2.verify_password(password.as_bytes(), &password_hash) {
    Ok(()) => Ok(true),

    Err(err) => match err {
      argon2::password_hash::Error::Password => Ok(false),
      _ => Err(JsError::new(&err.to_string())),
    },
  }
}
