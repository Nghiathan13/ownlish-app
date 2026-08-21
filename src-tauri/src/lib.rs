mod commands;
mod error;
mod models;
mod services;
mod storage;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            commands::catalog::read_catalog,
            commands::catalog::read_content_files
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
