use tauri::Manager;

#[tauri::command]
fn read_catalog(app: tauri::AppHandle) -> Result<String, String> {
    let data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("app_data_dir: {e}"))?;
    let catalog_path = data_dir.join("ownlish-data").join("catalog.json");
    std::fs::read_to_string(&catalog_path)
        .map_err(|e| format!("read {}: {e}", catalog_path.display()))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![read_catalog])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
