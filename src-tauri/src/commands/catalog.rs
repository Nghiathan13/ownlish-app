use std::path::PathBuf;

use tauri::{AppHandle, Manager};

use crate::error::AppError;
use crate::models::ipc::ContentFile;
use crate::services::catalog;

fn ownlish_data_root(data_dir: PathBuf) -> PathBuf {
    data_dir.join("ownlish-data")
}

fn data_root(app: &AppHandle) -> Result<PathBuf, AppError> {
    let data_dir = app
        .path()
        .app_data_dir()
        .map_err(|error| AppError::AppDataDir(error.to_string()))?;
    Ok(ownlish_data_root(data_dir))
}

#[tauri::command]
pub(crate) fn read_catalog(app: AppHandle) -> Result<String, AppError> {
    catalog::load_catalog(&data_root(&app)?)
}

#[tauri::command]
pub(crate) fn read_content_files(
    app: AppHandle,
    paths: Vec<String>,
) -> Result<Vec<ContentFile>, AppError> {
    catalog::load_test_parts(&data_root(&app)?, &paths)
}

#[cfg(test)]
mod tests {
    use super::ownlish_data_root;
    use std::path::PathBuf;

    #[test]
    fn builds_data_root_below_app_data_dir() {
        assert_eq!(
            ownlish_data_root(PathBuf::from("app-data")),
            PathBuf::from("app-data/ownlish-data"),
        );
    }
}
