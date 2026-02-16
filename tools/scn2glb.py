#!/usr/bin/env python3
"""
scn2glb.py - Convert Apple SceneKit .scn files to glTF 2.0 Binary (.glb)

Apple .scn files are NSKeyedArchiver binary plists containing serialized
SceneKit objects. This script extracts mesh geometry (vertices, normals,
UVs, triangle indices) and PBR texture references, outputting standard
.glb files loadable by Babylon.js, Three.js, or any glTF 2.0 viewer.

No Mac or Xcode required - pure Python.

Usage:
    python scn2glb.py <input.scn> <output.glb>
    python scn2glb.py <input_dir/> <output_dir/>

Requirements:
    Python 3.8+ (uses plistlib.UID)
    No external dependencies.

Limitations:
    - Parametric geometry (SCNBox, SCNSphere, etc.) is skipped
    - Skeleton/bone data is not exported (mesh is in bind pose)
    - Only triangle and polygon/quad primitives are exported
    - Metallic+roughness textures are not channel-packed (set as scalars)
"""

import json
import math
import os
import plistlib
import struct
import sys
from pathlib import Path


# ---------------------------------------------------------------------------
# NSKeyedArchiver helpers
# ---------------------------------------------------------------------------

class Archive:
    """Wraps an NSKeyedArchiver binary plist for convenient object traversal."""

    def __init__(self, path: str):
        with open(path, 'rb') as f:
            plist = plistlib.load(f)
        self.objects = plist['$objects']
        self.source_dir = Path(path).parent

    def get(self, uid):
        """Resolve a UID reference to its archived object."""
        if isinstance(uid, plistlib.UID):
            obj = self.objects[uid.data]
            if obj == '$null':
                return None
            return obj
        return uid

    def uid_index(self, uid) -> int:
        """Return the integer index of a UID."""
        if isinstance(uid, plistlib.UID):
            return uid.data
        return -1

    def classname(self, obj) -> str:
        """Get the Objective-C class name of an archived dict."""
        if isinstance(obj, dict) and '$class' in obj:
            cls = self.get(obj['$class'])
            if isinstance(cls, dict):
                return cls.get('$classname', '')
        return ''

    def to_list(self, obj) -> list:
        """Resolve NSArray / NSMutableArray to a Python list.

        Handles both serialization formats:
          - NS.objects: [uid, uid, ...]         (common)
          - NS.object.0, NS.object.1, ...       (alternate)
        """
        if obj is None:
            return []
        if isinstance(obj, plistlib.UID):
            obj = self.get(obj)
        if isinstance(obj, dict):
            cn = self.classname(obj)
            if cn in ('NSMutableArray', 'NSArray'):
                # Format 1: single list key
                if 'NS.objects' in obj:
                    return [self.get(uid) for uid in obj['NS.objects']]
                # Format 2: numbered keys
                items = []
                i = 0
                while f'NS.object.{i}' in obj:
                    items.append(self.get(obj[f'NS.object.{i}']))
                    i += 1
                return items
        if isinstance(obj, list):
            return [self.get(x) if isinstance(x, plistlib.UID) else x for x in obj]
        return []

    def to_dict(self, obj) -> dict:
        """Resolve NSDictionary / NSMutableDictionary to a Python dict."""
        if obj is None:
            return {}
        if isinstance(obj, plistlib.UID):
            obj = self.get(obj)
        if isinstance(obj, dict):
            cn = self.classname(obj)
            if cn in ('NSMutableDictionary', 'NSDictionary'):
                keys = [self.get(k) for k in obj.get('NS.keys', [])]
                vals = [self.get(v) for v in obj.get('NS.objects', [])]
                return dict(zip(keys, vals))
        return {}

    def to_bytes(self, obj) -> bytes:
        """Extract raw bytes from NSData / NSMutableData."""
        if isinstance(obj, bytes):
            return obj
        if isinstance(obj, plistlib.UID):
            obj = self.get(obj)
        if obj is None:
            return b''
        if isinstance(obj, bytes):
            return obj
        if isinstance(obj, dict):
            return obj.get('NS.bytes', obj.get('NS.data', b''))
        return b''

    def to_string(self, obj):
        """Resolve a value to a Python string, or None."""
        if isinstance(obj, plistlib.UID):
            obj = self.get(obj)
        if isinstance(obj, str):
            return obj
        if isinstance(obj, dict):
            cn = self.classname(obj)
            if cn in ('NSMutableString', 'NSString'):
                return obj.get('NS.string', '')
        return None


# ---------------------------------------------------------------------------
# Geometry extraction
# ---------------------------------------------------------------------------

SEMANTIC_MAP = {
    'kGeometrySourceSemanticVertex': 'POSITION',
    'kGeometrySourceSemanticNormal': 'NORMAL',
    'kGeometrySourceSemanticTexcoord': 'TEXCOORD_0',
}


def extract_sources(ar: Archive, geom: dict) -> dict:
    """Extract vertex attribute buffers from an SCNGeometry."""
    sources = {}
    for scn_key, gltf_key in SEMANTIC_MAP.items():
        if scn_key not in geom:
            continue
        src_array = ar.to_list(geom[scn_key])
        if not src_array:
            continue
        src = src_array[0]
        if not isinstance(src, dict):
            continue
        raw = ar.to_bytes(src.get('data', b''))
        count = src.get('vectorCount', 0)
        if raw and count > 0:
            sources[gltf_key] = {
                'data': raw,
                'count': count,
                'components': src.get('componentsPerVector', 3),
                'bpc': src.get('bytesPerComponent', 4),
                'stride': src.get('dataStride', 12),
                'offset': src.get('dataOffset', 0),
            }
    return sources


def extract_elements(ar: Archive, geom: dict) -> list:
    """Extract index buffers from an SCNGeometry.

    Handles:
      - primitiveType 0: triangles (3 indices each)
      - primitiveType 4: polygons (auto-detect verts/polygon, triangulate quads)
    """
    elements = []
    if 'elements' not in geom:
        return elements
    for elem in ar.to_list(geom['elements']):
        if not isinstance(elem, dict):
            continue
        raw = ar.to_bytes(elem.get('elementData', elem.get('data', b'')))
        ptype = elem.get('primitiveType', 0)
        pcount = elem.get('primitiveCount', 0)
        bpi = elem.get('bytesPerIndex', 2)

        if not raw or pcount == 0:
            continue

        if ptype == 0:
            # Triangles: 3 indices per primitive
            elements.append({'data': raw, 'count': pcount, 'bpi': bpi})

        elif ptype == 4:
            # Polygons: auto-detect verts per polygon from data size
            total_indices = len(raw) // bpi
            verts_per_poly = total_indices // pcount if pcount > 0 else 0

            if verts_per_poly < 3:
                continue

            # Triangulate: fan from first vertex of each polygon
            fmt = '<H' if bpi == 2 else '<I'
            tri_indices = bytearray()
            tri_count = 0

            for p in range(pcount):
                base = p * verts_per_poly * bpi
                idx = []
                for v in range(verts_per_poly):
                    off = base + v * bpi
                    if off + bpi <= len(raw):
                        idx.append(struct.unpack_from(fmt, raw, off)[0])

                # Fan triangulation: (0,1,2), (0,2,3), (0,3,4), ...
                for t in range(len(idx) - 2):
                    tri_indices.extend(struct.pack(fmt, idx[0]))
                    tri_indices.extend(struct.pack(fmt, idx[t + 1]))
                    tri_indices.extend(struct.pack(fmt, idx[t + 2]))
                    tri_count += 1

            if tri_count > 0:
                elements.append({
                    'data': bytes(tri_indices),
                    'count': tri_count,
                    'bpi': bpi,
                })

    return elements


def extract_texture_paths(ar: Archive, geom: dict) -> dict:
    """Extract texture file paths from SCNGeometry's materials."""
    textures = {}
    if 'materials' not in geom:
        return textures
    for mat in ar.to_list(geom['materials']):
        if not isinstance(mat, dict):
            continue
        channel_map = {
            'diffuse': 'baseColor',
            'emission': 'emissive',
            'normal': 'normal',
        }
        for scn_ch, our_ch in channel_map.items():
            if scn_ch not in mat:
                continue
            prop = ar.get(mat[scn_ch])
            if not isinstance(prop, dict):
                continue
            path = _find_texture_path(ar, prop)
            if path:
                textures[our_ch] = path
    return textures


def _find_texture_path(ar: Archive, prop: dict):
    """Try to extract a texture file path from an SCNMaterialProperty.

    Handles multiple storage formats:
      - Direct string in 'path' / 'contents' key
      - NSDictionary in 'image' key with 'path' entry
      - NSURL in 'image' / 'contents' key
    """
    for key in ('path', 'image', 'contents'):
        if key not in prop:
            continue
        val = ar.get(prop[key])
        if isinstance(val, str) and '.' in val:
            return val
        if isinstance(val, dict):
            cn = ar.classname(val)
            # NSDictionary wrapper (common for 'image' key)
            if cn in ('NSMutableDictionary', 'NSDictionary'):
                d = ar.to_dict(val)
                p = d.get('path')
                if isinstance(p, str) and '.' in p:
                    return p
            # NSURL
            for url_key in ('NS.relative', 'relativePath', 'path'):
                if url_key in val:
                    s = ar.to_string(val.get(url_key))
                    if s and '.' in s:
                        return s
    return None


# ---------------------------------------------------------------------------
# glTF / GLB builder
# ---------------------------------------------------------------------------

def pack_attribute(sources: dict, attr_name: str, target_components: int) -> bytes:
    """Repack vertex attribute data into a tightly-packed float32 buffer."""
    src = sources[attr_name]
    data = src['data']
    count = src['count']
    cpv = min(src['components'], target_components)
    bpc = src['bpc']
    stride = src['stride']
    offset = src['offset']

    out = bytearray()
    for v in range(count):
        base = v * stride + offset
        for c in range(cpv):
            pos = base + c * bpc
            if pos + bpc <= len(data):
                out.extend(data[pos:pos + bpc])
            else:
                out.extend(b'\x00' * bpc)
        # Pad missing components (e.g. if source has 2 but we need 3)
        for _ in range(cpv, target_components):
            out.extend(b'\x00' * bpc)
    return bytes(out)


def compute_bounds(packed: bytes, count: int, components: int):
    """Compute min/max bounding box for float32 position data."""
    mins = [float('inf')] * components
    maxs = [float('-inf')] * components
    for v in range(count):
        for c in range(components):
            val = struct.unpack_from('<f', packed, (v * components + c) * 4)[0]
            if math.isfinite(val):
                mins[c] = min(mins[c], val)
                maxs[c] = max(maxs[c], val)
    return mins, maxs


def align4(buf: bytearray):
    """Pad bytearray to 4-byte alignment."""
    while len(buf) % 4:
        buf.append(0)


def build_glb(sources: dict, elements: list, texture_files: dict,
              mesh_name: str) -> bytes:
    """Build a complete .glb binary from extracted geometry data."""
    buf = bytearray()
    views = []
    accs = []
    images_list = []
    textures_list = []

    # --- Vertex attributes ---
    attr_specs = [
        ('POSITION',    'VEC3', 5126, 3),
        ('NORMAL',      'VEC3', 5126, 3),
        ('TEXCOORD_0',  'VEC2', 5126, 2),
    ]
    attrs = {}
    for attr_name, gltf_type, comp_type, n_comp in attr_specs:
        if attr_name not in sources:
            continue
        packed = pack_attribute(sources, attr_name, n_comp)
        count = sources[attr_name]['count']

        align4(buf)
        bv_off = len(buf)
        buf.extend(packed)

        bv_idx = len(views)
        views.append({
            'buffer': 0,
            'byteOffset': bv_off,
            'byteLength': len(packed),
            'target': 34962,  # ARRAY_BUFFER
        })

        acc = {
            'bufferView': bv_idx,
            'componentType': comp_type,
            'count': count,
            'type': gltf_type,
        }
        if attr_name == 'POSITION':
            mins, maxs = compute_bounds(packed, count, n_comp)
            acc['min'] = mins
            acc['max'] = maxs

        attrs[attr_name] = len(accs)
        accs.append(acc)

    # --- Index buffers (combine all element groups) ---
    all_idx_data = bytearray()
    total_idx_count = 0
    max_bpi = 2
    for e in elements:
        max_bpi = max(max_bpi, e['bpi'])

    # Normalize all indices to the same bpi, then concatenate
    for e in elements:
        idx_count = e['count'] * 3
        src_fmt = '<H' if e['bpi'] == 2 else '<I'
        dst_fmt = '<H' if max_bpi == 2 else '<I'
        for i in range(idx_count):
            off = i * e['bpi']
            if off + e['bpi'] <= len(e['data']):
                val = struct.unpack_from(src_fmt, e['data'], off)[0]
                all_idx_data.extend(struct.pack(dst_fmt, val))
        total_idx_count += idx_count

    idx_acc = None
    if total_idx_count > 0:
        align4(buf)
        bv_off = len(buf)
        buf.extend(all_idx_data)
        align4(buf)

        bv_idx = len(views)
        views.append({
            'buffer': 0,
            'byteOffset': bv_off,
            'byteLength': len(all_idx_data),
            'target': 34963,  # ELEMENT_ARRAY_BUFFER
        })

        idx_acc = len(accs)
        accs.append({
            'bufferView': bv_idx,
            'componentType': 5123 if max_bpi == 2 else 5125,
            'count': total_idx_count,
            'type': 'SCALAR',
        })

    # --- Embed textures ---
    tex_indices = {}
    for tex_name, tex_path in texture_files.items():
        try:
            with open(tex_path, 'rb') as f:
                png_data = f.read()
        except (FileNotFoundError, PermissionError) as ex:
            print(f"    Warning: Could not read texture {tex_path}: {ex}")
            continue

        align4(buf)
        bv_off = len(buf)
        buf.extend(png_data)

        bv_idx = len(views)
        views.append({
            'buffer': 0,
            'byteOffset': bv_off,
            'byteLength': len(png_data),
        })

        img_idx = len(images_list)
        images_list.append({'bufferView': bv_idx, 'mimeType': 'image/png'})

        tex_idx = len(textures_list)
        textures_list.append({'source': img_idx, 'sampler': 0})
        tex_indices[tex_name] = tex_idx

    # --- Material ---
    pbr = {'metallicFactor': 0.8, 'roughnessFactor': 0.4}
    if 'baseColor' in tex_indices:
        pbr['baseColorTexture'] = {'index': tex_indices['baseColor']}
    else:
        pbr['baseColorFactor'] = [0.5, 0.5, 0.5, 1.0]

    gltf_mat = {
        'name': mesh_name + '_material',
        'pbrMetallicRoughness': pbr,
        'doubleSided': True,
    }
    if 'normal' in tex_indices:
        gltf_mat['normalTexture'] = {'index': tex_indices['normal']}
    if 'emissive' in tex_indices:
        gltf_mat['emissiveTexture'] = {'index': tex_indices['emissive']}
        gltf_mat['emissiveFactor'] = [1.0, 1.0, 1.0]

    # --- Assemble glTF JSON ---
    prim = {'attributes': attrs, 'mode': 4, 'material': 0}
    if idx_acc is not None:
        prim['indices'] = idx_acc

    gltf = {
        'asset': {
            'version': '2.0',
            'generator': 'scn2glb.py (StarRaidersToo)',
        },
        'scene': 0,
        'scenes': [{'nodes': [0]}],
        'nodes': [{'mesh': 0, 'name': mesh_name}],
        'meshes': [{'primitives': [prim], 'name': mesh_name}],
        'materials': [gltf_mat],
        'buffers': [{'byteLength': len(buf)}],
        'bufferViews': views,
        'accessors': accs,
    }
    if images_list:
        gltf['images'] = images_list
        gltf['textures'] = textures_list
        gltf['samplers'] = [{
            'magFilter': 9729,   # LINEAR
            'minFilter': 9987,   # LINEAR_MIPMAP_LINEAR
            'wrapS': 10497,      # REPEAT
            'wrapT': 10497,      # REPEAT
        }]

    # --- Pack GLB container ---
    json_bytes = json.dumps(gltf, separators=(',', ':')).encode('utf-8')
    while len(json_bytes) % 4:
        json_bytes += b' '
    align4(buf)

    total = 12 + 8 + len(json_bytes) + 8 + len(buf)

    glb = bytearray()
    # GLB header
    glb.extend(struct.pack('<III', 0x46546C67, 2, total))  # magic, version, length
    # JSON chunk
    glb.extend(struct.pack('<II', len(json_bytes), 0x4E4F534A))
    glb.extend(json_bytes)
    # BIN chunk
    glb.extend(struct.pack('<II', len(buf), 0x004E4942))
    glb.extend(buf)

    return bytes(glb)


# ---------------------------------------------------------------------------
# Conversion driver
# ---------------------------------------------------------------------------

PARAMETRIC_TYPES = (
    'SCNBox', 'SCNSphere', 'SCNCylinder', 'SCNTube',
    'SCNTorus', 'SCNCone', 'SCNCapsule', 'SCNPlane', 'SCNPyramid',
)


def convert(scn_path: str, glb_path: str, textures_base: Path = None) -> bool:
    """Convert a single .scn file to .glb.  Returns True on success."""
    scn_path = Path(scn_path)
    print(f"\n{'=' * 60}")
    print(f"  {scn_path.name}  ({scn_path.stat().st_size:,} bytes)")
    print(f"{'=' * 60}")

    ar = Archive(str(scn_path))

    # --- Find SCNGeometry objects (raw mesh, not parametric) ---
    geos = []
    for i, obj in enumerate(ar.objects):
        if ar.classname(obj) == 'SCNGeometry':
            geos.append((i, obj))

    if not geos:
        found_param = [ar.classname(obj) for obj in ar.objects
                       if isinstance(obj, dict) and ar.classname(obj) in PARAMETRIC_TYPES]
        if found_param:
            print(f"  SKIP: parametric geometry only ({', '.join(found_param)})")
        else:
            print(f"  SKIP: no geometry found")
        return False

    print(f"  Found {len(geos)} SCNGeometry object(s)")

    # --- Pick the best geometry (first one with vertex data) ---
    best_geom = None
    best_idx = -1
    best_count = 0
    for geom_idx, geom in geos:
        sources = extract_sources(ar, geom)
        if 'POSITION' in sources:
            count = sources['POSITION']['count']
            if best_geom is None or count > best_count:
                best_geom = geom
                best_idx = geom_idx
                best_count = count

    if best_geom is None:
        print(f"  ERROR: no geometry has vertex position data")
        return False

    geom = best_geom
    geom_idx = best_idx

    # --- Determine mesh name from parent SCNNode ---
    mesh_name = scn_path.stem
    for obj in ar.objects:
        if not isinstance(obj, dict):
            continue
        if ar.classname(obj) != 'SCNNode':
            continue
        g = obj.get('geometry')
        if g is not None and isinstance(g, plistlib.UID) and g.data == geom_idx:
            name = ar.to_string(obj.get('name'))
            if name:
                mesh_name = name
            break

    # --- Extract geometry data ---
    sources = extract_sources(ar, geom)
    elems = extract_elements(ar, geom)
    tex_rel_paths = extract_texture_paths(ar, geom)

    print(f"  Mesh name: {mesh_name}")
    for attr, src in sources.items():
        print(f"    {attr}: {src['count']:,} vertices, "
              f"{src['components']} components, stride={src['stride']}")

    total_tris = sum(e['count'] for e in elems)
    if elems:
        print(f"    Triangles: {total_tris:,} (from {len(elems)} element group(s))")

    if 'POSITION' not in sources:
        print(f"  ERROR: no vertex position data found")
        return False

    # --- Resolve texture file paths ---
    tex_base = textures_base or scn_path.parent
    resolved_textures = {}
    for ch, rel_path in tex_rel_paths.items():
        full = tex_base / rel_path
        if full.exists():
            resolved_textures[ch] = str(full)
            print(f"    Texture [{ch}]: {rel_path}")
        else:
            # Search common subdirectories
            fname = Path(rel_path).name
            for subdir in ('HUMON Textures', 'BaseStarTextures', 'textures', '.'):
                candidate = tex_base / subdir / fname
                if candidate.exists():
                    resolved_textures[ch] = str(candidate)
                    print(f"    Texture [{ch}]: {subdir}/{fname}")
                    break
            else:
                print(f"    Texture [{ch}]: {rel_path} [NOT FOUND]")

    # --- Build and write .glb ---
    glb = build_glb(sources, elems, resolved_textures, mesh_name)

    out_path = Path(glb_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, 'wb') as f:
        f.write(glb)

    v = sources['POSITION']['count']
    n_tex = len(resolved_textures)
    print(f"\n  -> {out_path}  ({len(glb):,} bytes)")
    print(f"     {v:,} vertices, {total_tris:,} triangles, {n_tex} embedded textures")
    return True


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        print("Usage:")
        print("  python scn2glb.py <input.scn> <output.glb>")
        print("  python scn2glb.py <input_dir/> <output_dir/>")
        sys.exit(1)

    inp = Path(sys.argv[1])
    out = Path(sys.argv[2])

    if inp.is_file():
        ok = convert(inp, out, inp.parent)
        sys.exit(0 if ok else 1)
    elif inp.is_dir():
        out.mkdir(parents=True, exist_ok=True)
        converted = 0
        skipped = 0
        for scn in sorted(inp.glob('*.scn')):
            glb = out / (scn.stem + '.glb')
            if convert(scn, glb, inp):
                converted += 1
            else:
                skipped += 1
        print(f"\n{'=' * 60}")
        print(f"  Done: {converted} converted, {skipped} skipped")
        print(f"{'=' * 60}")
    else:
        print(f"Error: {inp} not found")
        sys.exit(1)


if __name__ == '__main__':
    main()
