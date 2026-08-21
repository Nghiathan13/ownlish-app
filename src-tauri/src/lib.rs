use std::path::{Path, PathBuf};
use tauri::Manager;

/// Resolve a content path relative to the canonical data root.
/// Rejects absolute paths, `..` traversal, and paths that escape the root
/// after symlink resolution (canonicalize).
fn resolve_content_path(root_canon: &Path, rel: &str) -> Result<PathBuf, String> {
    let rel_path = Path::new(rel);
    if rel_path.is_absolute() || rel.contains("..") {
        return Err(format!("invalid path: {rel}"));
    }
    let full = root_canon.join(rel_path);
    let canon = full
        .canonicalize()
        .map_err(|e| format!("read {rel}: {e}"))?;
    if !canon.starts_with(root_canon) {
        return Err(format!("path escapes data root: {rel}"));
    }
    Ok(canon)
}

#[tauri::command]
fn read_catalog(app: tauri::AppHandle) -> Result<String, String> {
    let data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("app_data_dir: {e}"))?;
    let catalog_path = data_dir.join("ownlish-data").join("catalog.json");
    let content = std::fs::read_to_string(&catalog_path)
        .map_err(|e| format!("read {}: {e}", catalog_path.display()))?;
    Ok(content)
}

#[derive(serde::Serialize)]
struct ContentFile {
    path: String,
    content: String,
}

#[tauri::command]
fn read_content_files(
    app: tauri::AppHandle,
    paths: Vec<String>,
) -> Result<Vec<ContentFile>, String> {
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
        let canon = resolve_content_path(&root_canon, path)?;
        let content = std::fs::read_to_string(&canon).map_err(|e| format!("read {path}: {e}"))?;
        out.push(ContentFile {
            path: path.clone(),
            content,
        });
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

#[cfg(test)]
mod tests {
    use super::{resolve_content_path, ContentFile};
    use std::fs;
    #[cfg(unix)]
    use std::os::unix::fs::symlink;
    use std::path::PathBuf;

    fn temp_root(name: &str) -> PathBuf {
        let dir = std::env::temp_dir().join(format!("ownlish-test-{}-{name}", std::process::id()));
        let _ = fs::remove_dir_all(&dir);
        fs::create_dir_all(&dir).unwrap();
        dir
    }

    #[test]
    fn resolves_relative_path_inside_root() {
        let root = temp_root("ok");
        let file = root.join("part_1.json");
        fs::write(&file, "{}").unwrap();

        let root_canon = root.canonicalize().unwrap();
        let resolved = resolve_content_path(&root_canon, "part_1.json").unwrap();
        assert_eq!(resolved, file.canonicalize().unwrap());

        fs::remove_dir_all(&root).unwrap();
    }

    #[test]
    fn rejects_absolute_paths() {
        let root = temp_root("abs");
        let root_canon = root.canonicalize().unwrap();
        assert!(resolve_content_path(&root_canon, "/etc/passwd").is_err());
        fs::remove_dir_all(&root).unwrap();
    }

    #[test]
    fn rejects_dotdot_traversal() {
        let root = temp_root("dotdot");
        let root_canon = root.canonicalize().unwrap();
        assert!(resolve_content_path(&root_canon, "content/../secret.json").is_err());
        assert!(resolve_content_path(&root_canon, "../secret.json").is_err());
        fs::remove_dir_all(&root).unwrap();
    }

    #[test]
    #[cfg(unix)]
    fn rejects_symlink_escaping_root() {
        let root = temp_root("symlink");
        let outside = std::env::temp_dir().join(format!("ownlish-outside-{}", std::process::id()));
        fs::create_dir_all(&outside).unwrap();
        let secret = outside.join("secret.json");
        fs::write(&secret, "{}").unwrap();

        let link = root.join("escape");
        symlink(&secret, &link).unwrap();

        let root_canon = root.canonicalize().unwrap();
        assert!(resolve_content_path(&root_canon, "escape").is_err());

        fs::remove_dir_all(&root).unwrap();
        fs::remove_dir_all(&outside).unwrap();
    }

    #[test]
    fn rejects_missing_file() {
        let root = temp_root("missing");
        let root_canon = root.canonicalize().unwrap();
        assert!(resolve_content_path(&root_canon, "nope.json").is_err());
        fs::remove_dir_all(&root).unwrap();
    }

    #[test]
    fn content_file_serializes_as_object() {
        // pin the IPC contract: { path, content } objects, NOT [path, content] tuples
        let file = ContentFile {
            path: "toeic/ets_19/test_01/part_1.json".into(),
            content: "{}".into(),
        };
        let value = serde_json::to_value(&file).unwrap();
        assert_eq!(value["path"], "toeic/ets_19/test_01/part_1.json");
        assert_eq!(value["content"], "{}");
    }
}
