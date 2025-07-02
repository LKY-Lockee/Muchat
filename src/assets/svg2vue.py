import re
from typing import Any
import xml.etree.ElementTree as ET
import json
from jsoncomment import JsonComment
from pathlib import Path

SNIPPETPATH = Path("./.vscode/vue.code-snippets")
SVGDIR = Path("./src/assets/svg")
OUTPUTDIR = Path("./src/svg")

def read_snippet_template():
	with open(SNIPPETPATH, 'r', encoding='utf-8') as f:
		parser = JsonComment(json)
		snippets = parser.load(f)
	
	return snippets['svg']['body']

def parse_svg_file(svg_path: Path):
	try:
		tree = ET.parse(svg_path)
		root = tree.getroot()
		
		t = root.get('t')
		_class = root.get('class')
		viewBox = root.get('viewBox')
		version = root.get('version')
		p_id = root.get('p-id')
		
		paths = []
		for path in root.findall('.//{http://www.w3.org/2000/svg}path'):
			path_data = {
				'd': path.get('d', ''),
				'p-id': path.get('p-id', '')
			}
			paths.append(path_data)
		
		return {
			't': t,
			'class': _class,
			'viewBox': viewBox,
			'version': version,
			'p-id': p_id,
			'paths': paths
		}
	except Exception as e:
		print(e)
		return None

def generate_vue_component(svg_info: dict[str, Any], component_name: str, template_body):
	paths_html = []
	for i, path in enumerate(svg_info['paths']):
		path_html = f'<path d="{path["d"]}" p-id="{path["p-id"]}"></path>'
		paths_html.append(path_html)
	
	paths_content = '\n'.join(paths_html)

	replacements = {
        '1': component_name,
        '2': svg_info['t'],
        '3': svg_info['class'],
        '4': svg_info['viewBox'],
        '5': svg_info['version'],
        '6': svg_info['p-id'],
        '0': paths_content
    }

	vue_content = []
	for line in template_body:
		line = re.sub(r'\$(?:\{(\d+):[^}]*\}|(\d+))', lambda m: replacements.get(m.group(1) or m.group(2), m.group(0)), line)
		vue_content.append(line)
	
	return '\n'.join(vue_content)

def process_svg_files():
	template_body = read_snippet_template()
	
	OUTPUTDIR.mkdir(exist_ok=True)
	
	for svg_file in SVGDIR.glob("*.svg"):
		svg_info = parse_svg_file(svg_file)
		if not svg_info:
			continue
		
		base_name = svg_file.stem
		component_name = f"SVG{''.join(word.capitalize() for word in base_name.split('_'))}"
		
		vue_content = generate_vue_component(svg_info, component_name, template_body)
		
		vue_file_path = OUTPUTDIR / f"{component_name}.vue"
		with open(vue_file_path, 'w', encoding='utf-8') as f:
			f.write(vue_content)

if __name__ == "__main__":
	process_svg_files()