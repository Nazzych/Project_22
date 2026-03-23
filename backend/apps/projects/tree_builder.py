# utils/tree_builder.py
#Деф для побудови дерева файлів з плоского списку файлів проекту.
def build_file_tree (files):
    tree = {}

    for file in files:
        parts = file.path.strip ("/").split ("/")
        current = tree

        for i, part in enumerate (parts):
            if part not in current:
                is_dir = True if i < len (parts) - 1 or file.is_directory else False
                current [part] = {"type": "folder" if is_dir else "file", "children": {} if is_dir else None}
            current = current [part]["children"] if current [part]["children"] is not None else current

#Деф для форматування дерева у потрібну структуру для фронтенду.
    def format_tree (node):
        result = []
        for name, data in node.items():
            item = {"name": name, "type": data ["type"]}
            if data ["type"] == "folder":
                item ["children"] = format_tree (data ["children"])
            result.append (item)
        return result

    return {"name": "root", "type": "folder", "children": format_tree (tree)}
