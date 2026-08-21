use serde::Serialize;
use thiserror::Error;

#[derive(Debug, Error)]
pub(crate) enum AppError {
    #[error("app_data_dir: {0}")]
    AppDataDir(String),
    #[error("data root: {0}")]
    DataRoot(#[source] std::io::Error),
    #[error("invalid path: {0}")]
    InvalidPath(String),
    #[error("path escapes data root: {0}")]
    PathEscapesDataRoot(String),
    #[error("read {path}: {source}")]
    ReadFile {
        path: String,
        #[source]
        source: std::io::Error,
    },
}

impl Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::AppError;

    #[test]
    fn serializes_error_message_for_ipc() {
        let error = AppError::InvalidPath("../secret.json".into());
        let value = serde_json::to_value(error).unwrap();
        assert_eq!(value, "invalid path: ../secret.json");
    }
}
