use std::path::{Path, PathBuf};

use crate::error::AppError;

pub(crate) fn resolve_content_path(root_canon: &Path, rel: &str) -> Result<PathBuf, AppError> {
    let rel_path = Path::new(rel);
    if rel_path.is_absolute() || rel.contains("..") {
        return Err(AppError::InvalidPath(rel.into()));
    }

    let canonical_path =
        root_canon
            .join(rel_path)
            .canonicalize()
            .map_err(|source| AppError::ReadFile {
                path: rel.into(),
                source,
            })?;
    if !canonical_path.starts_with(root_canon) {
        return Err(AppError::PathEscapesDataRoot(rel.into()));
    }

    Ok(canonical_path)
}

#[cfg(test)]
mod tests {
    use super::resolve_content_path;
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
}
