import pathlib

files = [pathlib.Path('css/style.css'), pathlib.Path('css/admin.css')]

try:
    import cssutils
except ImportError:
    print('cssutils is not installed')
    raise

parser = cssutils.CSSParser(raiseExceptions=False)
print('cwd', pathlib.Path.cwd())
for f in files:
    print('---', f)
    sheet = parser.parseFile(str(f))
    print('rules', len(sheet.cssRules))
    if parser.log:
        print('LOG COUNT', len(parser.log))
        for err in parser.log:
            print('ERR', err)
