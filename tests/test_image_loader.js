import GdkPixbuf from 'gi://GdkPixbuf';
import GLib from 'gi://GLib';

function getScaledImageDimensions(filePath, maxWidth = 320, maxHeight = 180) {
    let [info, origW, origH] = GdkPixbuf.Pixbuf.get_file_info(filePath);
    if (!info) {
        throw new Error('Invalid image');
    }

    let scale = Math.min(maxWidth / origW, maxHeight / origH, 1.0);
    let targetW = Math.max(1, Math.round(origW * scale));
    let targetH = Math.max(1, Math.round(origH * scale));

    let pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_scale(
        filePath,
        targetW,
        targetH,
        true
    );

    return {
        pixbuf,
        width: pixbuf.get_width(),
        height: pixbuf.get_height(),
        hasAlpha: pixbuf.get_has_alpha(),
        rowstride: pixbuf.get_rowstride(),
        pixels: pixbuf.get_pixels()
    };
}

// Create 3 test images: Landscape (800x400), Portrait (300x900), Square (500x500), Small (100x60)
let landscapePath = GLib.build_filenamev([GLib.get_tmp_dir(), 'test_landscape.png']);
let portraitPath = GLib.build_filenamev([GLib.get_tmp_dir(), 'test_portrait.png']);
let squarePath = GLib.build_filenamev([GLib.get_tmp_dir(), 'test_square.png']);
let smallPath = GLib.build_filenamev([GLib.get_tmp_dir(), 'test_small.png']);

GdkPixbuf.Pixbuf.new(GdkPixbuf.Colorspace.RGB, false, 8, 800, 400).savev(landscapePath, 'png', [], []);
GdkPixbuf.Pixbuf.new(GdkPixbuf.Colorspace.RGB, true, 8, 300, 900).savev(portraitPath, 'png', [], []);
GdkPixbuf.Pixbuf.new(GdkPixbuf.Colorspace.RGB, false, 8, 500, 500).savev(squarePath, 'png', [], []);
GdkPixbuf.Pixbuf.new(GdkPixbuf.Colorspace.RGB, true, 8, 100, 60).savev(smallPath, 'png', [], []);

let l = getScaledImageDimensions(landscapePath, 320, 180);
print(`Landscape (800x400): ${l.width}x${l.height}, hasAlpha=${l.hasAlpha}`);
if (l.width !== 320 || l.height !== 160) throw new Error('Landscape scale incorrect');

let p = getScaledImageDimensions(portraitPath, 320, 180);
print(`Portrait (300x900): ${p.width}x${p.height}, hasAlpha=${p.hasAlpha}`);
if (p.width !== 60 || p.height !== 180) throw new Error('Portrait scale incorrect');

let s = getScaledImageDimensions(squarePath, 320, 180);
print(`Square (500x500): ${s.width}x${s.height}, hasAlpha=${s.hasAlpha}`);
if (s.width !== 180 || s.height !== 180) throw new Error('Square scale incorrect');

let sm = getScaledImageDimensions(smallPath, 320, 180);
print(`Small (100x60): ${sm.width}x${sm.height}, hasAlpha=${sm.hasAlpha}`);
if (sm.width !== 100 || sm.height !== 60) throw new Error('Small not preserved');

print('All aspect ratio image scaling calculations and pixbuf operations succeeded!');
