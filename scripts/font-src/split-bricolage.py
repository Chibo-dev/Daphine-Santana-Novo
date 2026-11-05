# splitfont.py <src.woff2> <outdir> : split the display face into a Portuguese main cut and an "ext" cut with every other
# codepoint of the original; prints both unicode-ranges (for the two @font-face rules) and the sizes.
import sys, os
from fontTools.ttLib import TTFont
from fontTools import subset

src, outdir = sys.argv[1], sys.argv[2]
main_chars = (" !\"%'(),-./0123456789:;?"
              "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
              "ÁÂÃÉÊÍÓÔÕÚÇ"
              "áàâãéêíóôõúç"
              "–—‘’“”…· ")
allcp = set(TTFont(src).getBestCmap().keys())
main = sorted({ord(c) for c in main_chars} & allcp)
ext = sorted(allcp - set(main))

def ranges(cps):
    out, s, p = [], None, None
    for c in cps:
        if s is None: s = p = c
        elif c == p + 1: p = c
        else: out.append((s, p)); s = p = c
    if s is not None: out.append((s, p))
    return ','.join(f'U+{a:X}' if a == b else f'U+{a:X}-{b:X}' for a, b in out)

def cut(cps, name):
    o = subset.Options(); o.layout_features = ['*']; o.flavor = 'woff2'
    f = TTFont(src); s = subset.Subsetter(o); s.populate(unicodes=cps); s.subset(f)
    p = os.path.join(outdir, name); f.save(p); return os.path.getsize(p)

# whitespace/control codepoints go in the main range too, so text nodes' newlines never point at the ext file
print('main', cut(main, 'bricolage-grotesque-pt.woff2'), 'U+9-D,' + ranges(main))
print('ext', cut(ext, 'bricolage-grotesque-ext.woff2'), ranges(ext))
