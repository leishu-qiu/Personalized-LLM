texts = ["1", "2", "3", "4", "5"]
metadatas = [{'source': 'xxx'} for _ in texts]
metadatas = metadatas or [{} for _ in texts]
for metadata, text in zip(metadatas, texts):
    metadata[self._text_key] = text