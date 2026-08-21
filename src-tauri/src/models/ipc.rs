#[derive(serde::Serialize)]
pub(crate) struct ContentFile {
    pub(crate) path: String,
    pub(crate) content: String,
}

#[cfg(test)]
mod tests {
    use super::ContentFile;

    #[test]
    fn serializes_as_an_object() {
        let file = ContentFile {
            path: "toeic/ets_19/test_01/part_1.json".into(),
            content: "{}".into(),
        };
        let value = serde_json::to_value(file).unwrap();
        assert_eq!(value["path"], "toeic/ets_19/test_01/part_1.json");
        assert_eq!(value["content"], "{}");
    }
}
