use std::fs;
use std::path::Path;

use crate::error::AppError;
use crate::models::ipc::ContentFile;
use crate::storage::paths::resolve_content_path;

pub(crate) fn read_catalog(data_root: &Path) -> Result<String, AppError> {
    let catalog_path = data_root.join("catalog.json");
    fs::read_to_string(&catalog_path).map_err(|source| AppError::ReadFile {
        path: catalog_path.display().to_string(),
        source,
    })
}

pub(crate) fn read_content_files(
    data_root: &Path,
    paths: &[String],
) -> Result<Vec<ContentFile>, AppError> {
    let root_canon = data_root.canonicalize().map_err(AppError::DataRoot)?;
    let mut files = Vec::with_capacity(paths.len());

    for path in paths {
        let canonical_path = resolve_content_path(&root_canon, path)?;
        let content = fs::read_to_string(&canonical_path).map_err(|source| AppError::ReadFile {
            path: path.clone(),
            source,
        })?;
        files.push(ContentFile {
            path: path.clone(),
            content,
        });
    }

    Ok(files)
}

#[cfg(test)]
mod tests {
    use super::{read_catalog, read_content_files};
    use crate::error::AppError;
    use std::fs;
    use std::path::PathBuf;

    fn temp_root(name: &str) -> PathBuf {
        let dir = std::env::temp_dir().join(format!("ownlish-test-{}-{name}", std::process::id()));
        let _ = fs::remove_dir_all(&dir);
        fs::create_dir_all(&dir).unwrap();
        dir
    }

    #[test]
    fn reads_catalog_from_data_root() {
        let root = temp_root("catalog");
        fs::write(root.join("catalog.json"), "{\"tests\":[]}").unwrap();

        assert_eq!(read_catalog(&root).unwrap(), "{\"tests\":[]}");

        fs::remove_dir_all(root).unwrap();
    }

    #[test]
    fn reads_requested_content_files_in_order() {
        let root = temp_root("content-files");
        fs::create_dir_all(root.join("parts")).unwrap();
        fs::write(root.join("parts/part_1.json"), "{\"items\":[]}").unwrap();

        let files = read_content_files(&root, &["parts/part_1.json".into()]).unwrap();

        assert_eq!(files.len(), 1);
        assert_eq!(files[0].path, "parts/part_1.json");
        assert_eq!(files[0].content, "{\"items\":[]}");

        fs::remove_dir_all(root).unwrap();
    }

    #[test]
    fn reports_filesystem_read_errors() {
        let root = temp_root("read-errors");
        assert!(matches!(
            read_catalog(&root),
            Err(AppError::ReadFile { .. })
        ));

        fs::create_dir_all(root.join("parts/directory.json")).unwrap();
        assert!(matches!(
            read_content_files(&root, &["parts/directory.json".into()]),
            Err(AppError::ReadFile { .. })
        ));

        fs::remove_dir_all(root).unwrap();
    }

    #[test]
    fn reports_a_missing_data_root() {
        let root = temp_root("missing-root");
        fs::remove_dir_all(&root).unwrap();

        assert!(matches!(
            read_content_files(&root, &["parts/part_1.json".into()]),
            Err(AppError::DataRoot(_))
        ));
    }
}
