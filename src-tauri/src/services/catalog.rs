use std::path::Path;

use crate::error::AppError;
use crate::models::ipc::ContentFile;
use crate::storage::catalog_files;

pub(crate) fn load_catalog(data_root: &Path) -> Result<String, AppError> {
    catalog_files::read_catalog(data_root)
}

pub(crate) fn load_test_parts(
    data_root: &Path,
    paths: &[String],
) -> Result<Vec<ContentFile>, AppError> {
    catalog_files::read_content_files(data_root, paths)
}

#[cfg(test)]
mod tests {
    use super::{load_catalog, load_test_parts};
    use std::fs;

    #[test]
    fn loads_catalog_through_the_service_boundary() {
        let root =
            std::env::temp_dir().join(format!("ownlish-test-service-{}", std::process::id()));
        let _ = fs::remove_dir_all(&root);
        fs::create_dir_all(&root).unwrap();
        fs::write(root.join("catalog.json"), "{\"tests\":[]}").unwrap();

        assert_eq!(load_catalog(&root).unwrap(), "{\"tests\":[]}");

        fs::remove_dir_all(root).unwrap();
    }

    #[test]
    fn loads_test_parts_through_the_service_boundary() {
        let root =
            std::env::temp_dir().join(format!("ownlish-test-service-parts-{}", std::process::id()));
        let _ = fs::remove_dir_all(&root);
        fs::create_dir_all(root.join("parts")).unwrap();
        fs::write(root.join("parts/part_1.json"), "{\"items\":[]}").unwrap();

        let files = load_test_parts(&root, &["parts/part_1.json".into()]).unwrap();

        assert_eq!(files.len(), 1);
        assert_eq!(files[0].path, "parts/part_1.json");

        fs::remove_dir_all(root).unwrap();
    }
}
