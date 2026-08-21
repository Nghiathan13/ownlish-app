use std::path::Path;
use tauri::Manager;

#[tauri::command]
fn read_catalog(app: tauri::AppHandle) -> Result<String, String> {
    let data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("app_data_dir: {e}"))?;
    let catalog_path = data_dir.join("ownlish-data").join("catalog.json");
    let start = std::time::Instant::now();
    let content = std::fs::read_to_string(&catalog_path)
        .map_err(|e| format!("read {}: {e}", catalog_path.display()))?;
    println!(
        "[catalog] rust fs read: {:?} ({} bytes)",
        start.elapsed(),
        content.len()
    );
    Ok(content)
}

#[tauri::command]
fn read_content_files(
    app: tauri::AppHandle,
    paths: Vec<String>,
) -> Result<Vec<(String, String)>, String> {
    let data_root = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("app_data_dir: {e}"))?
        .join("ownlish-data");
    let root_canon = data_root
        .canonicalize()
        .map_err(|e| format!("data root: {e}"))?;

    let mut out = Vec::with_capacity(paths.len());
    for path in &paths {
        let rel = Path::new(path);
        if rel.is_absolute() || path.contains("..") {
            return Err(format!("invalid path: {path}"));
        }
        let full = root_canon.join(rel);
        let canon = full
            .canonicalize()
            .map_err(|e| format!("read {path}: {e}"))?;
        if !canon.starts_with(&root_canon) {
            return Err(format!("path escapes data root: {path}"));
        }
        let content = std::fs::read_to_string(&canon).map_err(|e| format!("read {path}: {e}"))?;
        out.push((path.clone(), content));
    }
    Ok(out)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![read_catalog, read_content_files])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
