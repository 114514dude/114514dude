import bpy,sys
from pathlib import Path
src=Path(sys.argv[sys.argv.index('--')+1]).resolve()
dst=Path(sys.argv[sys.argv.index('--')+2]).resolve()
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.wm.open_mainfile(filepath=str(src))
for o in list(bpy.data.objects):
    if o.type in {'CAMERA','LIGHT'}:bpy.data.objects.remove(o,do_unlink=True)
dst.parent.mkdir(parents=True,exist_ok=True)
bpy.ops.export_scene.gltf(filepath=str(dst),export_format='GLB',export_apply=True,export_yup=True)
assert dst.is_file() and dst.stat().st_size>10000
print('CONVERTED',src.name,dst.name,dst.stat().st_size)
