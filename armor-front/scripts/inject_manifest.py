#!/usr/bin/env python3
import json,re,struct,hashlib
from pathlib import Path
root=Path(__file__).resolve().parent.parent
asset=root/'app/src/main/assets'
records=[
 ('T-34-85','t34_85','Lotnik','https://opengameart.org/content/t-3485'),
 ('Panzer III','panzer_iii','konserwa','https://opengameart.org/content/panzerkampfwagen-iii'),
 ('Abrams (Freeciv)','abrams_freeciv','Sketlux / yd','https://opengameart.org/content/abrams-tank')
]
manifest={'models':{}}
for name,slug,author,source in records:
 f=asset/'assets/models'/f'{slug}.glb'
 b=f.read_bytes()
 assert len(b)>10000 and b[:4]==b'glTF'
 assert struct.unpack('<I',b[8:12])[0]==len(b)
 length,kind=struct.unpack('<II',b[12:20])
 assert kind==0x4E4F534A
 obj=json.loads(b[20:20+length])
 assert len(obj.get('meshes',[]))>0
 manifest['models'][name]=dict(path='assets/models/'+slug+'.glb',author=author,source=source,license='CC0-1.0',licenseUrl='https://creativecommons.org/publicdomain/zero/1.0/',sha256=hashlib.sha256(b).hexdigest(),modified='Converted to GLB from original Blender asset')
 print('VERIFIED',name,len(b),'meshes:',len(obj['meshes']))
assert len(manifest['models'])==3
p=asset/'index.html'
s=p.read_text()
s,count=re.subn(r'(<script id="assetManifest" type="application/json">).*?(</script>)',lambda m:m.group(1)+json.dumps(manifest,ensure_ascii=False)+m.group(2),s,flags=re.S)
assert count==1
p.write_text(s)
(root/'MODEL_CREDITS.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
